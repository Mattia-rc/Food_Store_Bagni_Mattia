import { api } from '../../../shared/api/axiosInstance'
import type { Pagina } from '../../../shared/api/Pagina'
import type { FiltrosProducto, Producto, ProductoInput } from '../types/producto'

export type StockInput = Pick<ProductoInput, 'stock' | 'disponible'>

export const productosApi = {
  listar: async (params: FiltrosProducto) => (await api.get<Pagina<Producto>>('/productos', { params })).data,
  crear: async (data: ProductoInput) => (await api.post<Producto>('/productos', data)).data,
  editar: async (id: number, data: Partial<ProductoInput>) => (await api.put<Producto>(`/productos/${id}`, data)).data,
  stock: async (id: number, data: StockInput) => (await api.patch<Producto>(`/productos/${id}/stock`, data)).data,
  eliminar: async (id: number) => { await api.delete(`/productos/${id}`) },
}
