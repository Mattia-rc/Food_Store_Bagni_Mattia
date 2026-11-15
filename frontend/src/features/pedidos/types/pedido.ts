export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export const estados: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
}

export interface ItemPedidoCreate {
  producto_id: number
  cantidad: number
}

export interface DetallePedido extends ItemPedidoCreate {
  nombre_producto: string
  precio_unitario: number
  subtotal: number
}

export interface PedidoInput {
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  items: ItemPedidoCreate[]
}

export interface Pedido extends Omit<PedidoInput, 'items'> {
  id: number
  usuario_id: number
  estado: EstadoPedido
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

export interface FiltrosPedido {
  skip: number
  limit: number
  estado?: EstadoPedido
  propios?: boolean
}
