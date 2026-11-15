from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import ActiveUser, AdminUser
from app.modules.pedidos.schemas import (
    CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos,
)
from app.modules.pedidos.service import PedidoAjeno, PedidoNoEncontrado, PedidoService, ReglaPedido
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado


router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def get_pedido_write_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork(write=True))


Service = Annotated[PedidoService, Depends(get_pedido_service)]
WriteService = Annotated[PedidoService, Depends(get_pedido_write_service)]


@router.post("", response_model=PedidoRead, status_code=201)
def crear_pedido(data: PedidoCreate, usuario: ActiveUser, service: WriteService):
    try:
        return service.crear(usuario, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(404, str(exc)) from exc
    except ReglaPedido as exc:
        raise HTTPException(400, str(exc)) from exc


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: ActiveUser, service: Service, estado: EstadoPedido | None = None,
    skip: Annotated[int, Query(ge=0)] = 0, limit: Annotated[int, Query(ge=1, le=100)] = 20, propios: bool = False,
):
    return service.listar(usuario, estado, skip, limit, propios)


@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(admin: AdminUser, service: Service):
    return service.resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(id: int, usuario: ActiveUser, service: Service):
    try:
        return service.obtener(id, usuario)
    except PedidoNoEncontrado as exc:
        raise HTTPException(404, str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(403, str(exc)) from exc


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(id: int, data: CambioEstado, admin: AdminUser, service: WriteService):
    try:
        return service.cambiar_estado(id, data.estado)
    except (PedidoNoEncontrado, ProductoNoEncontrado) as exc:
        raise HTTPException(404, str(exc)) from exc
    except ReglaPedido as exc:
        raise HTTPException(400, str(exc)) from exc


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(id: int, usuario: ActiveUser, service: WriteService):
    try:
        return service.cancelar_propio(id, usuario)
    except (PedidoNoEncontrado, ProductoNoEncontrado) as exc:
        raise HTTPException(404, str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(403, str(exc)) from exc
    except ReglaPedido as exc:
        raise HTTPException(400, str(exc)) from exc
