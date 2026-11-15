from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


Service = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(admin: AdminUser, service: Service):
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(id: int, admin: AdminUser, service: Service):
    return service.cambiar_estado(id, admin.id, False)


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(id: int, admin: AdminUser, service: Service):
    return service.cambiar_estado(id, admin.id, True)
