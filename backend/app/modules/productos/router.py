from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import AdminUser
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate, ProductoRead, ProductoStockUpdate, ProductoUpdate, ProductosPaginados,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork


router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


def get_producto_write_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork(write=True))


Service = Annotated[ProductoService, Depends(get_producto_service)]
WriteService = Annotated[ProductoService, Depends(get_producto_write_service)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: Service, skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: str | None = None, categoria_id: int | None = None, disponible: bool | None = None,
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{id}", response_model=ProductoRead)
def obtener_producto(id: int, service: Service):
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(404, str(exc)) from exc


@router.post("", response_model=ProductoRead, status_code=201)
def crear_producto(data: ProductoCreate, admin: AdminUser, service: WriteService):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(404, str(exc)) from exc


@router.put("/{id}", response_model=ProductoRead)
def actualizar_producto(id: int, data: ProductoUpdate, admin: AdminUser, service: WriteService):
    try:
        return service.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(404, str(exc)) from exc


@router.patch("/{id}/stock", response_model=ProductoRead)
def actualizar_stock(id: int, data: ProductoStockUpdate, admin: AdminUser, service: WriteService):
    try:
        return service.actualizar_stock(id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(404, str(exc)) from exc


@router.delete("/{id}", status_code=204)
def eliminar_producto(id: int, admin: AdminUser, service: WriteService):
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(404, str(exc)) from exc
