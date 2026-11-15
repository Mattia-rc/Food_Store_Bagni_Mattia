import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AdminTable } from '../../../shared/components/AdminTable'
import { Button, dinero, EstadoError, Paginacion, Skeleton } from '../../../shared/ui/primitives'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm, StockForm } from '../components/ProductoForms'
import { useEliminarProducto, useProductos } from '../hooks/useProductos'
import type { Producto } from '../types/producto'

export function AdminProductosPage() {
  const [edicion, setEdicion] = useState<Producto | 'nuevo' | null>(null)
  const [stock, setStock] = useState<Producto | null>(null)
  const [lote, setLote] = useState(0)
  const query = useProductos({ skip: lote * 100, limit: 100 })
  const categorias = useCategorias()
  const eliminar = useEliminarProducto()
  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'nombre', header: 'Producto' },
    { id: 'categoria', header: 'Categoría', cell: ({ row }) => row.original.categoria.nombre },
    { accessorKey: 'precio_base', header: 'Precio', cell: ({ row }) => dinero(row.original.precio_base) },
    { accessorKey: 'stock', header: 'Stock' },
    { accessorKey: 'disponible', header: 'Disponibilidad', cell: ({ row }) => row.original.disponible ? 'Disponible' : 'Pausado' },
    { id: 'acciones', header: 'Acciones', cell: ({ row: { original: producto } }) => <div className="row">
      <Button className="secondary small" disabled={!categorias.data} onClick={() => setEdicion(producto)}>Editar</Button>
      <Button className="secondary small" onClick={() => setStock(producto)}>Stock</Button>
      <Button className="danger small" disabled={eliminar.isPending} onClick={() => {
        if (window.confirm(`¿Dar de baja "${producto.nombre}"?`)) eliminar.mutate(producto.id)
      }}>Dar de baja</Button>
    </div> },
  ]
  return <div className="page">
    <div className="section-header">
      <h1>Productos</h1>
      <Button disabled={!categorias.data?.length} onClick={() => setEdicion('nuevo')}><Plus size={17} /> Nuevo producto</Button>
    </div>
    {categorias.data?.length === 0 && <p className="muted">Creá una categoría activa para cargar un producto.</p>}
    <EstadoError error={query.error} retry={() => void query.refetch()} />
    <EstadoError error={categorias.error} retry={() => void categorias.refetch()} />
    <EstadoError error={eliminar.error} />
    {query.isPending && <Skeleton count={2} />}
    {query.data && <>
      <AdminTable data={query.data.items} columns={columns} empty="No hay productos activos" />
      <Paginacion page={lote} limit={100} total={query.data.total} onChange={setLote} />
    </>}
    {edicion && categorias.data && <ProductoForm producto={edicion === 'nuevo' ? undefined : edicion}
      categorias={categorias.data} onClose={() => setEdicion(null)} />}
    {stock && <StockForm producto={stock} onClose={() => setStock(null)} />}
  </div>
}
