# Food Store

Trabajo Práctico Integrador de Programación 4 · UTN  
Alumno: Bagni Mattia

- Repositorio público: `https://github.com/Mattia-rc/Food_Store_Bagni_Mattia`
- Video de demostración: `https://www.youtube.com/watch?v=X3ObxTg54nw`

Food Store permite consultar el menú, armar un carrito y pedir comida a domicilio mediante pago en efectivo o por transferencia. El administrador gestiona el catálogo, el stock, los pedidos y los usuarios.

## Requisitos

- Python 3.11 a 3.13.
- PostgreSQL 15 o superior. Para desarrollo local también se admite SQLite.
- Node.js 20.19 o superior y pnpm 9 o superior.
- Dos terminales, una para el backend y otra para el frontend.

## Backend

Desde la raíz del proyecto, entrá en `backend/` y creá un entorno virtual.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
cp .env.example .env
pip install -r requirements.txt
```

En Windows PowerShell, usá `py -3.12 -m venv .venv`, `.\.venv\Scripts\Activate.ps1` y `Copy-Item .env.example .env` para crear y activar el entorno y copiar el archivo.

Para usar PostgreSQL con los valores de ejemplo, abrí `psql` con un usuario que pueda crear roles y bases. Ejecutá las siguientes sentencias una vez en PostgreSQL o en el Query Tool de pgAdmin.

```sql
CREATE ROLE foodstore WITH LOGIN PASSWORD 'foodstore';
CREATE DATABASE foodstore_db OWNER foodstore;
```

Si ya tenés una base, editá `DATABASE_URL` en `backend/.env` para usar tus credenciales. Si querés ejecutar la demo con SQLite, cambiá esa variable a `sqlite:///./foodstore.db`. El archivo de base se crea al ejecutar el seed.

Reemplazá `SECRET_KEY` por una clave privada. Podés generar una con `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

La API usa el prefijo `/api/v1`. La documentación está en [Swagger UI](http://localhost:8000/docs) y [ReDoc](http://localhost:8000/redoc).

| Variable | Valor de ejemplo | Uso |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://foodstore:foodstore@localhost:5432/foodstore_db` | Conexión a la base de datos |
| `SECRET_KEY` | Clave privada de al menos 32 caracteres | Firma del JWT |
| `ALGORITHM` | `HS256` | Algoritmo de firma |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Vigencia de la sesión en minutos |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Origen permitido por CORS |

### Datos iniciales

El seed carga 3 categorías, 8 productos con stock y una cuenta administradora para la demo. Podés ejecutarlo más de una vez durante la instalación.

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `admin` | `Admin1234!` | `admin` |

## Frontend

En otra terminal, desde la raíz del proyecto:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm build
pnpm dev
```

En Windows PowerShell, usá `Copy-Item .env.example .env`. Abrí [Food Store](http://localhost:5173).

| Variable | Valor de ejemplo | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | URL base de Axios |

Usá `localhost` tanto en el frontend como en la URL de la API para que el navegador envíe la cookie de sesión. La cookie `access_token` es HttpOnly y la API verifica el rol en las operaciones administrativas.

## Recorrido de la aplicación

1. Registrá una cuenta de cliente, ingresá y buscá productos por nombre o categoría.
2. Agregá productos al carrito, cambiá las cantidades y recargá la página para verificar que se conservan.
3. Confirmá el pedido con dirección y forma de pago. En **Mis pedidos**, abrí el detalle y verificá que el estado inicial sea **Pendiente**.
4. Ingresá con el administrador para consultar el resumen y gestionar categorías, productos, disponibilidad y usuarios.
5. Desde administración, avanzá un pedido a **En preparación** y luego a **Entregado**. Para verificar la restitución de stock, usá otro pedido. Anotá el stock antes de comprar, verificá el descuento después de la compra, cancelá el pedido pendiente y comprobá que vuelva al valor inicial.

El backend organiza las operaciones por dominio en routers, servicios, repositorios y unidades de trabajo. La creación y la cancelación de pedidos actualizan el stock en una única transacción. El detalle de cada pedido conserva el nombre y el precio unitario de la compra. El frontend utiliza TanStack Query para los datos de la API, TanStack Form para formularios, TanStack Table para las tablas de administración y Zustand para la sesión y el carrito.
