from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import AdminUser
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


def get_categoria_write_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork(write=True))


Service = Annotated[CategoriaService, Depends(get_categoria_service)]
WriteService = Annotated[CategoriaService, Depends(get_categoria_write_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: Service):
    return service.listar()


@router.get("/{id}", response_model=CategoriaRead)
def obtener_categoria(id: int, service: Service):
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(404, str(exc)) from exc


@router.post("", response_model=CategoriaRead, status_code=201)
def crear_categoria(data: CategoriaCreate, admin: AdminUser, service: WriteService):
    try:
        return service.crear(data)
    except NombreDuplicado as exc:
        raise HTTPException(409, str(exc)) from exc


@router.put("/{id}", response_model=CategoriaRead)
def actualizar_categoria(id: int, data: CategoriaUpdate, admin: AdminUser, service: WriteService):
    try:
        return service.actualizar(id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(404, str(exc)) from exc
    except NombreDuplicado as exc:
        raise HTTPException(409, str(exc)) from exc


@router.delete("/{id}", status_code=204)
def eliminar_categoria(id: int, admin: AdminUser, service: WriteService):
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(404, str(exc)) from exc
