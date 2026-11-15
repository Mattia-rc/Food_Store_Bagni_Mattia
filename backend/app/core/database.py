from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


is_sqlite = settings.DATABASE_URL.startswith("sqlite")
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=True,
)


if is_sqlite:
    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, record):
        connection.execute("PRAGMA foreign_keys = ON")


def session_factory() -> Session:
    return Session(engine)


def create_all_tables() -> None:
    from app.modules import models

    SQLModel.metadata.create_all(engine)
