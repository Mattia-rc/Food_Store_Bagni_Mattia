from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self, usuario_id: int | None, estado: str | None, skip: int, limit: int,
    ) -> tuple[int, list[Pedido]]:
        stmt = select(Pedido)
        if usuario_id is not None:
            stmt = stmt.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            stmt = stmt.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        resultados = stmt.options(selectinload(Pedido.items)).order_by(Pedido.id.desc())
        return total, list(self.session.exec(resultados.offset(skip).limit(limit)).all())

    def count_by_estado(self) -> dict[str, int]:
        stmt = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return dict(self.session.exec(stmt).all())

    def count_entre(self, desde: datetime, hasta: datetime) -> int:
        stmt = select(func.count()).select_from(Pedido).where(
            Pedido.created_at >= desde, Pedido.created_at < hasta,
        )
        return self.session.exec(stmt).one()

    def ingresos_entregados(self) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == "ENTREGADO")
        return self.session.exec(stmt).one()
