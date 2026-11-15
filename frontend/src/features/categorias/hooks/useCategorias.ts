import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriasApi } from '../api/categorias'
import type { CategoriaInput } from '../types/categoria'

export const useCategorias = () => useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.listar })

export function useGuardarCategoria(id?: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoriaInput) => id === undefined ? categoriasApi.crear(data) : categoriasApi.editar(id, data),
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: ['categorias'] }),
      client.invalidateQueries({ queryKey: ['productos'] }),
    ]),
  })
}

export function useEliminarCategoria() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: categoriasApi.eliminar,
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: ['categorias'] }),
      client.invalidateQueries({ queryKey: ['productos'] }),
    ]),
  })
}
