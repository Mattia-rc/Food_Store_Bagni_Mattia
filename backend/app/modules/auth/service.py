from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.deps import CUENTA_DESACTIVADA
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import UserCreate
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def registrar(self, data: UserCreate) -> UserPublic:
        email = data.email.lower()
        hashed_password = hash_password(data.password)
        try:
            with UsuarioUnitOfWork(write=True) as uow:
                if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(email):
                    raise HTTPException(409, "El usuario o el correo ya está registrado")
                usuario = uow.usuarios.add(Usuario(
                    username=data.username, full_name=data.full_name, email=email,
                    hashed_password=hashed_password,
                ))
                uow.flush()
                return UserPublic.model_validate(usuario)
        except IntegrityError as exc:
            raise HTTPException(409, "El usuario o el correo ya está registrado") from exc

    def autenticar(self, username: str, password: str) -> str:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            if not usuario or not verify_password(password, usuario.hashed_password):
                raise HTTPException(401, "Usuario o contraseña incorrectos")
            if usuario.disabled:
                raise HTTPException(400, CUENTA_DESACTIVADA)
            return create_access_token(usuario.id)
