import { ChefHat, LogOut, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button, EstadoError } from '../ui/primitives'

export function Navbar() {
  const { usuario, cargando, logout } = useAuthStore()
  const cantidad = useCartStore((state) => state.items.reduce((total, item) => total + item.cantidad, 0))
  const navigate = useNavigate()
  const [error, setError] = useState<unknown>(null)
  const [saliendo, setSaliendo] = useState(false)

  async function cerrarSesion() {
    setSaliendo(true)
    setError(null)
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      setError(err)
    } finally {
      setSaliendo(false)
    }
  }
  return <header className="site-header">
    <div className="container navbar">
      <Link to="/" className="brand"><span><ChefHat size={23} /></span> Food Store</Link>
      <nav className="navlinks" aria-label="Navegación principal">
        <NavLink to="/" end>Menú</NavLink>
        {usuario && <NavLink to="/mis-pedidos">Mis pedidos</NavLink>}
        {usuario?.role === 'admin' && <NavLink to="/admin/resumen">Administración</NavLink>}
      </nav>
      <div className="nav-actions">
        {!cargando && (usuario ? <>
          <span className="identity">{usuario.full_name} <small>{usuario.role === 'admin' ? 'Admin' : 'Cliente'}</small></span>
          <Button className="secondary icon" aria-label="Cerrar sesión" title="Cerrar sesión" disabled={saliendo}
            onClick={() => void cerrarSesion()}><LogOut size={17} /></Button>
        </> : <Link className="login-link" to="/login">Ingresar</Link>)}
        <NavLink className="button cart-link" to="/carrito" aria-label={`Carrito, ${cantidad} unidades`}>
          <ShoppingBag size={17} /><span>Carrito</span><b>{cantidad}</b>
        </NavLink>
      </div>
    </div>
    {Boolean(error) && <div className="container"><EstadoError error={error} /></div>}
  </header>
}

export function MainLayout() {
  return <>
    <Navbar />
    <main className="container"><Outlet /></main>
    <footer className="site-footer"><div className="container">Food Store</div></footer>
  </>
}

const adminLinks = [
  ['/admin/resumen', 'Resumen'], ['/admin/categorias', 'Categorías'], ['/admin/productos', 'Productos'],
  ['/admin/pedidos', 'Pedidos'], ['/admin/usuarios', 'Usuarios'],
]

export function AdminLayout() {
  return <div className="admin-layout">
    <nav className="admin-nav" aria-label="Administración">
      {adminLinks.map(([path, label]) => <NavLink key={path} to={path}>{label}</NavLink>)}
    </nav>
    <Outlet />
  </div>
}
