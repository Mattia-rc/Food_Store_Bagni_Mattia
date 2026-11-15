from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return len(password.encode("utf-8")) <= 72 and password_context.verify(
        password, hashed_password
    )


def create_access_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expires}, settings.SECRET_KEY, settings.ALGORITHM)


def decode_access_token(token: str) -> int | None:
    try:
        claims = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM],
            options={"require_exp": True, "require_sub": True},
        )
        return int(claims["sub"])
    except (JWTError, ValueError, TypeError):
        return None
