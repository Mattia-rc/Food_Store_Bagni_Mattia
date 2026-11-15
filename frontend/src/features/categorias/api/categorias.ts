import { api } from '../../../shared/api/axiosInstance'
import type { Categoria, CategoriaInput } from '../types/categoria'

export const categoriasApi = {
  listar: async () => (await api.get<Categoria[]>('/categorias')).data,
  crear: async (data: CategoriaInput) => (await api.post<Categoria>('/categorias', data)).data,
  editar: async (id: number, data: CategoriaInput) => (await api.put<Categoria>(`/categorias/${id}`, data)).data,
  eliminar: async (id: number) => { await api.delete(`/categorias/${id}`) },
}
