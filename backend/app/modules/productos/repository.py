from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def search(
        self, skip: int, limit: int, search: str | None,
        categoria_id: int | None, disponible: bool | None,
    ) -> tuple[int, list[Producto]]:
        filtros = [Producto.activo.is_(True)]
        if search and search.strip():
            filtros.append(Producto.nombre.icontains(search.strip(), autoescape=True))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        stmt = (
            select(Producto).where(*filtros).options(selectinload(Producto.categoria))
            .order_by(Producto.id).offset(skip).limit(limit)
        )
        return total, list(self.session.exec(stmt).all())

    def get_by_nombre_categoria(self, nombre: str, categoria_id: int) -> Producto | None:
        stmt = select(Producto).where(Producto.nombre == nombre, Producto.categoria_id == categoria_id)
        return self.session.exec(stmt).first()
