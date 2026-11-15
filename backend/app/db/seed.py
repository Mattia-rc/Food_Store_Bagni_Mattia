from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository


CATEGORIAS = {
    "Principales": "Platos y sándwiches preparados al momento",
    "Acompañamientos": "Porciones para sumar a tu pedido",
    "Bebidas": "Bebidas frías de la casa",
}
PRODUCTOS = [
    ("Principales", "Hamburguesa de la casa", "Carne a la plancha, cheddar, cebolla y salsa de la casa.", 9800, 30, "hamburguesa"),
    ("Principales", "Pizza margarita", "Pizza de masa fina con tomate, mozzarella y albahaca.", 11900, 20, "pizza"),
    ("Principales", "Sándwich de pollo", "Pollo grillado, rúcula, tomate y mayonesa de limón.", 8700, 25, "sandwich"),
    ("Acompañamientos", "Papas rústicas", "Papas doradas con piel, romero y sal marina.", 4100, 40, "papas"),
    ("Acompañamientos", "Aros de cebolla", "Aros crocantes servidos con salsa barbacoa.", 4500, 22, "aros"),
    ("Acompañamientos", "Ensalada fresca", "Hojas verdes, tomate, zanahoria y vinagreta.", 4800, 18, "ensalada"),
    ("Bebidas", "Limonada de menta", "Limón exprimido, menta fresca y hielo.", 3500, 35, "limonada"),
    ("Bebidas", "Té frío de durazno", "Té negro con durazno y rodajas de limón.", 3300, 24, "te"),
]


def seed() -> None:
    create_all_tables()
    with ProductoUnitOfWork(write=True) as uow:
        usuarios = UsuarioRepository(uow.session)
        if usuarios.get_by_username("admin") is None:
            usuarios.add(Usuario(
                username="admin", full_name="Administrador", email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"), role="admin",
            ))
        categorias = {}
        for nombre, descripcion in CATEGORIAS.items():
            categoria = uow.categorias.get_by_nombre(nombre)
            if categoria is None:
                categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))
            categorias[nombre] = categoria
        uow.flush()
        for grupo, nombre, descripcion, precio, stock, imagen in PRODUCTOS:
            categoria = categorias[grupo]
            if uow.productos.get_by_nombre_categoria(nombre, categoria.id) is None:
                uow.productos.add(Producto(
                    categoria_id=categoria.id, nombre=nombre, descripcion=descripcion,
                    precio_base=precio, stock=stock, imagen_url=f"/menu/{imagen}.webp",
                ))
    print("Seed completado.")


if __name__ == "__main__":
    seed()
