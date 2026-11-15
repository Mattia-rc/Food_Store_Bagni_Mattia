from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select


T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    model: type[T]

    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: int, *, lock: bool = False) -> T | None:
        return self.session.get(self.model, id, with_for_update=lock)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, entity: T) -> T:
        self.session.add(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
