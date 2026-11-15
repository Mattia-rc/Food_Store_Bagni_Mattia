from datetime import datetime, timedelta, timezone
from math import fsum, isfinite
from zoneinfo import ZoneInfo

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario


TRANSICIONES = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}
ZONA_LOCAL = ZoneInfo("America/Argentina/Buenos_Aires")


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaPedido(Exception):
    pass


class StockInsuficiente(ReglaPedido):
    pass


class ProductoNoDisponible(ReglaPedido):
    pass


class ProductoRepetido(ReglaPedido):
    pass


class TransicionInvalida(ReglaPedido):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear(self, usuario: Usuario, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            if not data.items:
                raise ReglaPedido("El pedido debe contener al menos un producto")
            if len({item.producto_id for item in data.items}) != len(data.items):
                raise ProductoRepetido("El pedido contiene un producto repetido")
            pedido = uow.pedidos.add(Pedido(
                usuario_id=usuario.id, forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega, notas=data.notas, total=0,
            ))
            for item in sorted(data.items, key=lambda linea: linea.producto_id):
                producto = uow.productos.get_by_id(item.producto_id, lock=True)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(f"{producto.nombre} no está disponible")
                if item.cantidad < 1:
                    raise ReglaPedido("La cantidad debe ser al menos 1")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"Stock insuficiente para {producto.nombre}")
                subtotal = producto.precio_base * item.cantidad
                if not isfinite(subtotal):
                    raise ReglaPedido("El importe del pedido supera el máximo admitido")
                producto.stock -= item.cantidad
                pedido.items.append(DetallePedido(
                    producto_id=producto.id, cantidad=item.cantidad,
                    nombre_producto=producto.nombre, precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                ))
            try:
                pedido.total = fsum(linea.subtotal for linea in pedido.items)
            except OverflowError as exc:
                raise ReglaPedido("El importe del pedido supera el máximo admitido") from exc
            uow.flush()
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: Usuario, estado: EstadoPedido | None, skip: int, limit: int, propios: bool = False,
    ) -> PedidosPaginados:
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" and not propios else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(usuario_id, estado, skip, limit)
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(pedido) for pedido in pedidos],
            )

    def obtener(self, id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id)
            if usuario.role != "admin":
                self._validar_dueno(pedido, usuario)
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, id: int, estado: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id, lock=True)
            self._transicionar(uow, pedido, estado)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id, lock=True)
            self._validar_dueno(pedido, usuario)
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido propio pendiente")
            self._transicionar(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        hoy = datetime.now(ZONA_LOCAL).replace(hour=0, minute=0, second=0, microsecond=0)
        manana = hoy + timedelta(days=1)
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_entre(
                    hoy.astimezone(timezone.utc), manana.astimezone(timezone.utc),
                ),
                ingresos_entregados=uow.pedidos.ingresos_entregados(),
            )

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, id: int, *, lock: bool = False) -> Pedido:
        pedido = uow.pedidos.get_by_id(id, lock=lock)
        if not pedido:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _validar_dueno(pedido: Pedido, usuario: Usuario) -> None:
        if pedido.usuario_id != usuario.id:
            raise PedidoAjeno("El pedido pertenece a otro usuario")

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, estado: EstadoPedido) -> None:
        if estado not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(f"No se puede cambiar de {pedido.estado} a {estado}")
        if estado == "CANCELADO":
            for item in sorted(pedido.items, key=lambda linea: linea.producto_id):
                producto = uow.productos.get_by_id(item.producto_id, lock=True)
                if producto is None:
                    raise ProductoNoEncontrado(item.producto_id)
                producto.stock += item.cantidad
        pedido.estado = estado
        pedido.updated_at = datetime.now(timezone.utc)
