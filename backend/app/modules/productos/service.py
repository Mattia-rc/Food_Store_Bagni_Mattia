from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate, ProductoRead, ProductoStockUpdate, ProductoUpdate, ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    def __init__(self, id: int):
        super().__init__(f"Producto #{id} no encontrado")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(self, skip, limit, search, categoria_id, disponible) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(producto) for producto in productos],
            )

    def obtener(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = self._categoria_activa(uow, data.categoria_id)
            producto = uow.productos.add(Producto.model_validate(data))
            producto.categoria = categoria
            uow.flush()
            return ProductoRead.model_validate(producto)

    def actualizar(self, id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            categoria = None
            if data.categoria_id is not None:
                categoria = self._categoria_activa(uow, data.categoria_id)
            producto = self._activo(uow, id, lock=True)
            producto.sqlmodel_update(data.model_dump(exclude_unset=True))
            if categoria is not None:
                producto.categoria = categoria
            uow.flush()
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow, id, lock=True)
            producto.sqlmodel_update(data.model_dump(exclude_unset=True))
            return ProductoRead.model_validate(producto)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            self._activo(uow, id, lock=True).activo = False

    @staticmethod
    def _activo(uow: ProductoUnitOfWork, id: int, *, lock: bool = False) -> Producto:
        producto = uow.productos.get_by_id(id, lock=lock)
        if not producto or not producto.activo:
            raise ProductoNoEncontrado(id)
        return producto

    @staticmethod
    def _categoria_activa(uow: ProductoUnitOfWork, id: int):
        categoria = uow.categorias.get_by_id(id, lock=True)
        if not categoria or not categoria.activo:
            raise CategoriaNoEncontrada()
        return categoria
