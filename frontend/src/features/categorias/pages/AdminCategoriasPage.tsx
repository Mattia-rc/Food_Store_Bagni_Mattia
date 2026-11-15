import { useForm } from '@tanstack/react-form'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AdminTable } from '../../../shared/components/AdminTable'
import { Button, Campo, EstadoError, Input, Modal, Skeleton } from '../../../shared/ui/primitives'
import { useCategorias, useEliminarCategoria, useGuardarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria'

function CategoriaForm({ categoria, onClose }: { categoria?: Categoria; onClose: () => void }) {
  const guardar = useGuardarCategoria(categoria?.id)
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      try {
        await guardar.mutateAsync({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null })
        onClose()
      } catch {
        return
      }
    },
  })
  return <Modal title={categoria ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}>
    <form className="stack" onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
      <form.Field name="nombre" validators={{ onSubmit: ({ value }) =>
        value.trim().length >= 2 && value.trim().length <= 100 ? undefined : 'Ingresá entre 2 y 100 caracteres.' }}>
        {(field) => <Campo label="Nombre" error={field.state.meta.errors[0]}>
          <Input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
        </Campo>}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => <Campo label="Descripción">
          <textarea className="input" rows={3} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
        </Campo>}
      </form.Field>
      <EstadoError error={guardar.error} />
      <Button type="submit" disabled={guardar.isPending}>Guardar categoría</Button>
    </form>
  </Modal>
}

export function AdminCategoriasPage() {
  const query = useCategorias()
  const eliminar = useEliminarCategoria()
  const [edicion, setEdicion] = useState<Categoria | 'nueva' | null>(null)
  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'descripcion', header: 'Descripción', cell: ({ row }) => row.original.descripcion ?? '—' },
    { id: 'acciones', header: 'Acciones', cell: ({ row: { original: categoria } }) => <div className="row">
      <Button className="secondary small" onClick={() => setEdicion(categoria)}>Editar</Button>
      <Button className="danger small" disabled={eliminar.isPending} onClick={() => {
        if (window.confirm(`¿Dar de baja la categoría "${categoria.nombre}"? Sus productos seguirán activos.`)) eliminar.mutate(categoria.id)
      }}>Dar de baja</Button>
    </div> },
  ]
  return <div className="page">
    <div className="section-header">
      <h1>Categorías</h1>
      <Button onClick={() => setEdicion('nueva')}><Plus size={17} /> Nueva categoría</Button>
    </div>
    <EstadoError error={query.error} retry={() => void query.refetch()} />
    <EstadoError error={eliminar.error} />
    {query.isPending && <Skeleton count={2} />}
    {query.data && <AdminTable data={query.data} columns={columns} empty="No hay categorías activas" />}
    {edicion && <CategoriaForm categoria={edicion === 'nueva' ? undefined : edicion} onClose={() => setEdicion(null)} />}
  </div>
}
