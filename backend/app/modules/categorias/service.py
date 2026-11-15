from sqlalchemy.exc import IntegrityError

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    def __init__(self):
        super().__init__("Categoría no encontrada")


class NombreDuplicado(Exception):
    def __init__(self):
        super().__init__("El nombre de la categoría ya está en uso")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(categoria) for categoria in uow.categorias.list_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        try:
            with self.uow as uow:
                self._validar_nombre(uow, data.nombre)
                categoria = uow.categorias.add(Categoria.model_validate(data))
                uow.flush()
                return CategoriaRead.model_validate(categoria)
        except IntegrityError as exc:
            raise NombreDuplicado() from exc

    def actualizar(self, id: int, data: CategoriaUpdate) -> CategoriaRead:
        try:
            with self.uow as uow:
                categoria = self._activa(uow, id, lock=True)
                if data.nombre is not None:
                    self._validar_nombre(uow, data.nombre, id)
                categoria.sqlmodel_update(data.model_dump(exclude_unset=True))
                return CategoriaRead.model_validate(categoria)
        except IntegrityError as exc:
            raise NombreDuplicado() from exc

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            self._activa(uow, id, lock=True).activo = False

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, id: int, *, lock: bool = False) -> Categoria:
        categoria = uow.categorias.get_by_id(id, lock=lock)
        if not categoria or not categoria.activo:
            raise CategoriaNoEncontrada()
        return categoria

    @staticmethod
    def _validar_nombre(uow: CategoriaUnitOfWork, nombre: str, id: int | None = None) -> None:
        existente = uow.categorias.get_by_nombre(nombre)
        if existente and existente.id != id:
            raise NombreDuplicado()
