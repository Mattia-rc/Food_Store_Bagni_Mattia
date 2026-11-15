import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '../features/usuarios/types/usuario'
import { Skeleton } from '../shared/ui/primitives'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute({ roles }: { roles?: Rol[] }) {
  const { usuario, cargando } = useAuthStore()
  const location = useLocation()

  if (cargando) return <Skeleton count={1} />
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
