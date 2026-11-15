from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import ActiveUser
from app.modules.auth.schemas import AuthMessage, UserCreate
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserPublic


router = APIRouter(prefix="/auth", tags=["Autenticación"])
Service = Annotated[AuthService, Depends()]


@router.post("/register", response_model=UserPublic, status_code=201)
def register(data: UserCreate, service: Service):
    return service.registrar(data)


@router.post("/token", response_model=AuthMessage)
def token(
    form: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response,
    request: Request, service: Service,
):
    access_token = service.autenticar(form.username, form.password)
    response.set_cookie(
        "access_token", access_token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True, samesite="lax", secure=request.url.scheme == "https",
    )
    return AuthMessage(message="Login exitoso")


@router.post("/logout", response_model=AuthMessage)
def logout(response: Response, request: Request):
    response.delete_cookie(
        "access_token", httponly=True, samesite="lax", secure=request.url.scheme == "https",
    )
    return AuthMessage(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: ActiveUser):
    return UserPublic.model_validate(usuario)
