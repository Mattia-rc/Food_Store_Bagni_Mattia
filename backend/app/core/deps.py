from typing import Annotated

from fastapi import Cookie, Depends, HTTPException

from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(access_token: Annotated[str | None, Cookie()] = None) -> Usuario:
    user_id = decode_access_token(access_token) if access_token else None
    if user_id is not None:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_by_id(user_id)
            if usuario:
                return usuario.model_copy()
    raise HTTPException(401, "Sesión inválida o vencida")


def get_current_active_user(usuario: Annotated[Usuario, Depends(get_current_user)]) -> Usuario:
    if usuario.disabled:
        raise HTTPException(400, CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]):
    def check_role(usuario: Annotated[Usuario, Depends(get_current_active_user)]) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(403, "No tenés permiso para realizar esta acción")
        return usuario

    return check_role


ActiveUser = Annotated[Usuario, Depends(get_current_active_user)]
AdminUser = Annotated[Usuario, Depends(require_role(["admin"]))]
