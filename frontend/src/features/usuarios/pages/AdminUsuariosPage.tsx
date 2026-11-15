import type { ColumnDef } from '@tanstack/react-table'
import { AdminTable } from '../../../shared/components/AdminTable'
import { Button, EstadoError, Skeleton } from '../../../shared/ui/primitives'
import { useAuthStore } from '../../../store/authStore'
import { useCambiarUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { UserPublic } from '../types/usuario'

export function AdminUsuariosPage() {
  const query = useUsuarios()
  const cambiar = useCambiarUsuario()
  const actual = useAuthStore((state) => state.usuario)
  const columns: ColumnDef<UserPublic>[] = [
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Correo' },
    { accessorKey: 'role', header: 'Rol' },
    { accessorKey: 'disabled', header: 'Estado', cell: ({ row }) => row.original.disabled ? 'Desactivado' : 'Activo' },
    { id: 'acciones', header: 'Acciones', cell: ({ row: { original: usuario } }) =>
      usuario.id === actual?.id ? null : <Button className={`small ${usuario.disabled ? 'secondary' : 'danger'}`}
        disabled={cambiar.isPending} onClick={() => cambiar.mutate({ id: usuario.id, disabled: !usuario.disabled })}>
        {usuario.disabled ? 'Activar' : 'Desactivar'}
      </Button> },
  ]
  return <div className="page">
    <h1>Usuarios</h1>
    <EstadoError error={query.error} retry={() => void query.refetch()} />
    <EstadoError error={cambiar.error} />
    {query.isPending && <Skeleton count={2} />}
    {query.data && <AdminTable data={query.data} columns={columns} empty="No hay usuarios" />}
  </div>
}
