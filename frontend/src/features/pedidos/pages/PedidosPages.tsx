import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AdminTable } from '../../../shared/components/AdminTable'
import { Button, Card, dinero, EstadoError, EstadoVacio, Paginacion, Skeleton } from '../../../shared/ui/primitives'
import { useAuthStore } from '../../../store/authStore'
import { BadgeEstado, fechaPedido, PedidoDetalle } from '../components/PedidoDetalle'
import { useCambiarEstadoPedido, useCancelarPedido, usePedidos, useResumenPedidos } from '../hooks/usePedidos'
import { estados } from '../types/pedido'
import type { EstadoPedido, Pedido, ResumenPedidos } from '../types/pedido'

const LIMIT = 10

export function MisPedidosPage() {
  const [page, setPage] = useState(0)
  const [detalle, setDetalle] = useState<number | null>(null)
  const usuario = useAuthStore((state) => state.usuario)
  const pedidos = usePedidos({ skip: page * LIMIT, limit: LIMIT, propios: true })
  const cancelar = useCancelarPedido()
  const location = useLocation()
  const confirmado: unknown = location.state?.pedido

  return <div className="page">
    <h1>Mis pedidos</h1>
    {typeof confirmado === 'number' && <p className="success" role="status">Pedido #{confirmado} confirmado.</p>}
    <EstadoError error={pedidos.error} retry={() => void pedidos.refetch()} />
    <EstadoError error={cancelar.error} />
    {pedidos.isPending && <Skeleton count={2} />}
    {pedidos.data && <>
      {pedidos.data.items.length === 0 && <EstadoVacio title="Todavía no hay pedidos"><Link className="button" to="/">Ver menú</Link></EstadoVacio>}
      <div className="stack">{pedidos.data.items.map((pedido) => <Card className="order-card" key={pedido.id}>
        <div><h2>Pedido #{pedido.id}</h2><p className="muted">{fechaPedido(pedido.created_at)}</p></div>
        <BadgeEstado estado={pedido.estado} />
        <strong>{dinero(pedido.total)}</strong>
        <div className="row">
          <Button className="secondary small" onClick={() => setDetalle(pedido.id)}>Ver detalle</Button>
          {pedido.estado === 'PENDIENTE' && pedido.usuario_id === usuario?.id && <Button className="danger small"
            disabled={cancelar.isPending} onClick={() => {
              if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) cancelar.mutate(pedido.id)
            }}>Cancelar pedido</Button>}
        </div>
      </Card>)}</div>
      <Paginacion page={page} limit={LIMIT} total={pedidos.data.total} onChange={setPage} />
    </>}
    {detalle !== null && <PedidoDetalle id={detalle} onClose={() => setDetalle(null)} />}
  </div>
}

export function AdminPedidosPage() {
  const [page, setPage] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [detalle, setDetalle] = useState<number | null>(null)
  const pedidos = usePedidos({ skip: page * LIMIT, limit: LIMIT, estado: estado || undefined })
  const cambiar = useCambiarEstadoPedido()
  const columns: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: 'Pedido', cell: ({ row }) => `#${row.original.id}` },
    { accessorKey: 'usuario_id', header: 'Cliente', cell: ({ row }) => `#${row.original.usuario_id}` },
    { accessorKey: 'created_at', header: 'Fecha', cell: ({ row }) => fechaPedido(row.original.created_at) },
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    { accessorKey: 'total', header: 'Total', cell: ({ row }) => dinero(row.original.total) },
    { id: 'acciones', header: 'Acciones', cell: ({ row: { original: pedido } }) => {
      const siguiente = pedido.estado === 'PENDIENTE' ? 'EN_PREPARACION' : pedido.estado === 'EN_PREPARACION' ? 'ENTREGADO' : null
      return <div className="row">
        <Button className="secondary small" onClick={() => setDetalle(pedido.id)}>Ver detalle</Button>
        {siguiente && <>
          <Button className="secondary small" disabled={cambiar.isPending}
            onClick={() => cambiar.mutate({ id: pedido.id, estado: siguiente })}>
            {siguiente === 'EN_PREPARACION' ? 'Preparar' : 'Entregar'}
          </Button>
          <Button className="danger small" disabled={cambiar.isPending} onClick={() => {
            if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) cambiar.mutate({ id: pedido.id, estado: 'CANCELADO' })
          }}>Cancelar</Button>
        </>}
      </div>
    } },
  ]
  return <div className="page">
    <div className="section-header">
      <h1>Pedidos</h1>
      <select className="input" aria-label="Filtrar por estado" value={estado} onChange={(event) => {
        const valor = event.target.value as EstadoPedido | ''
        setEstado(valor); setPage(0)
      }}>
        <option value="">Todos los estados</option>
        {(Object.keys(estados) as EstadoPedido[]).map((key) => <option key={key} value={key}>{estados[key]}</option>)}
      </select>
    </div>
    <EstadoError error={pedidos.error} retry={() => void pedidos.refetch()} />
    <EstadoError error={cambiar.error} />
    {pedidos.isPending && <Skeleton count={2} />}
    {pedidos.data && <>
      <AdminTable data={pedidos.data.items} columns={columns} empty="No hay pedidos para este filtro" pageSize={LIMIT} />
      <Paginacion page={page} limit={LIMIT} total={pedidos.data.total} onChange={setPage} />
    </>}
    {detalle !== null && <PedidoDetalle id={detalle} onClose={() => setDetalle(null)} />}
  </div>
}

const indicadores: { key: keyof ResumenPedidos; label: string; moneda?: boolean }[] = [
  { key: 'pedidos_hoy', label: 'Pedidos de hoy' }, { key: 'pendientes', label: 'Pendientes' },
  { key: 'en_preparacion', label: 'En preparación' }, { key: 'entregados', label: 'Entregados' },
  { key: 'cancelados', label: 'Cancelados' }, { key: 'ingresos_entregados', label: 'Ingresos por entregas', moneda: true },
]

export function AdminResumenPage() {
  const resumen = useResumenPedidos()
  const data = resumen.data
  return <div className="page">
    <h1>Resumen del negocio</h1>
    <EstadoError error={resumen.error} retry={() => void resumen.refetch()} />
    {resumen.isPending && <Skeleton count={6} />}
    {data && <div className="metric-grid">{indicadores.map(({ key, label, moneda }) => <Card className="metric" key={key}>
      <h2>{label}</h2><strong>{moneda ? dinero(data[key]) : data[key]}</strong>
    </Card>)}</div>}
  </div>
}
