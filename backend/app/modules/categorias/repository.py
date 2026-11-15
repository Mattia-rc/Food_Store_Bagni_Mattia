from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def list_activas(self) -> list[Categoria]:
        stmt = select(Categoria).where(Categoria.activo.is_(True)).order_by(Categoria.nombre)
        return list(self.session.exec(stmt).all())

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
