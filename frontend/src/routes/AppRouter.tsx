import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage, RegisterPage, UnauthorizedPage } from '../features/auth/pages/AuthPages'
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage'
import { CarritoPage, CheckoutPage } from '../features/pedidos/pages/CompraPages'
import { AdminPedidosPage, AdminResumenPage, MisPedidosPage } from '../features/pedidos/pages/PedidosPages'
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage'
import { CatalogoPage } from '../features/productos/pages/CatalogoPage'
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage'
import { AdminLayout, MainLayout } from '../shared/layout/MainLayout'
import { EstadoVacio } from '../shared/ui/primitives'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return <BrowserRouter><Routes>
    <Route element={<MainLayout />}>
      <Route index element={<CatalogoPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="carrito" element={<CarritoPage />} />
      <Route path="unauthorized" element={<UnauthorizedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="mis-pedidos" element={<MisPedidosPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="resumen" replace />} />
          <Route path="resumen" element={<AdminResumenPage />} />
          <Route path="categorias" element={<AdminCategoriasPage />} />
          <Route path="productos" element={<AdminProductosPage />} />
          <Route path="pedidos" element={<AdminPedidosPage />} />
          <Route path="usuarios" element={<AdminUsuariosPage />} />
        </Route>
      </Route>
      <Route path="*" element={<EstadoVacio title="Página no encontrada"><Link className="button" to="/">Volver al menú</Link></EstadoVacio>} />
    </Route>
  </Routes></BrowserRouter>
}
