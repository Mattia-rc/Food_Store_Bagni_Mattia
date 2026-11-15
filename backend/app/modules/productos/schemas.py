from typing import Annotated

from pydantic import ConfigDict, FiniteFloat, StringConstraints, model_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


NombreProducto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
Precio = Annotated[FiniteFloat, Field(ge=0)]
Stock = Annotated[int, Field(ge=0, le=2147483647)]


class ProductoCreate(SQLModel):
    nombre: NombreProducto
    descripcion: str | None = None
    precio_base: Precio
    imagen_url: str | None = None
    stock: Stock = 0
    disponible: bool = True
    categoria_id: int


class ProductoStockUpdate(SQLModel):
    stock: Stock | None = None
    disponible: bool | None = None

    @model_validator(mode="after")
    def validar_campos(self):
        opcionales = {"descripcion", "imagen_url"}
        if any(getattr(self, campo) is None for campo in self.model_fields_set - opcionales):
            raise ValueError("Los campos enviados requieren un valor")
        return self


class ProductoUpdate(ProductoStockUpdate):
    nombre: NombreProducto | None = None
    descripcion: str | None = None
    precio_base: Precio | None = None
    imagen_url: str | None = None
    categoria_id: int | None = None


class ProductoRead(ProductoCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
