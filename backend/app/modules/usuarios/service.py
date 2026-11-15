from fastapi import HTTPException

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = sorted(uow.usuarios.get_all(), key=lambda usuario: usuario.username)
            return [UserPublic.model_validate(usuario) for usuario in usuarios]

    def cambiar_estado(self, id: int, admin_id: int, disabled: bool) -> UserPublic:
        with UsuarioUnitOfWork(write=True) as uow:
            usuario = uow.usuarios.get_by_id(id, lock=True)
            if usuario is None:
                raise HTTPException(404, "Usuario no encontrado")
            if disabled and id == admin_id:
                raise HTTPException(400, "No podés desactivar tu propia cuenta")
            usuario.disabled = disabled
            return UserPublic.model_validate(usuario)
