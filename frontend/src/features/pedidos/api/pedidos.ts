import { api } from '../../../shared/api/axiosInstance'
import type { Pagina } from '../../../shared/api/Pagina'
import type { EstadoPedido, FiltrosPedido, Pedido, PedidoInput, ResumenPedidos } from '../types/pedido'

export const pedidosApi = {
  listar: async (params: FiltrosPedido) => (await api.get<Pagina<Pedido>>('/pedidos', { params })).data,
  detalle: async (id: number) => (await api.get<Pedido>(`/pedidos/${id}`)).data,
  resumen: async () => (await api.get<ResumenPedidos>('/pedidos/resumen')).data,
  crear: async (data: PedidoInput) => (await api.post<Pedido>('/pedidos', data)).data,
  cambiarEstado: async ({ id, estado }: { id: number; estado: EstadoPedido }) =>
    (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data,
  cancelar: async (id: number) => (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data,
}
