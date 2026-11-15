import { dinero, EstadoError, Modal, Skeleton } from '../../../shared/ui/primitives'
import { useDetallePedido } from '../hooks/usePedidos'
import { estados } from '../types/pedido'
import type { EstadoPedido } from '../types/pedido'

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={`badge badge-${estado.toLowerCase()}`}>{estados[estado]}</span>
}

export function fechaPedido(fecha: string) {
  const fechaUtc = /Z$|[+-]\d{2}:\d{2}$/.test(fecha) ? fecha : `${fecha}Z`
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(fechaUtc))
}

export function PedidoDetalle({ id, onClose }: { id: number; onClose: () => void }) {
  const query = useDetallePedido(id)
  const pedido = query.data
  return <Modal title={`Pedido #${id}`} onClose={onClose}>
    <EstadoError error={query.error} retry={() => void query.refetch()} />
    {query.isPending && <Skeleton count={1} />}
    {pedido && <div className="stack">
      <div className="row"><BadgeEstado estado={pedido.estado} /><span className="muted">{fechaPedido(pedido.created_at)}</span></div>
      <dl className="detail-grid">
        <div><dt>Dirección de entrega</dt><dd>{pedido.direccion_entrega}</dd></div>
        <div><dt>Forma de pago</dt><dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd></div>
        {pedido.notas && <div><dt>Notas</dt><dd>{pedido.notas}</dd></div>}
      </dl>
      <ul className="line-list">{pedido.items.map((item) => <li key={item.producto_id}>
        <span>{item.cantidad} × {item.nombre_producto} <small>{dinero(item.precio_unitario)} c/u</small></span>
        <strong>{dinero(item.subtotal)}</strong>
      </li>)}</ul>
      <div className="total-line"><span>Total</span><strong>{dinero(pedido.total)}</strong></div>
    </div>}
  </Modal>
}
