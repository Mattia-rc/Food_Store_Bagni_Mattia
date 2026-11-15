import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../api/productos'
import type { StockInput } from '../api/productos'
import type { FiltrosProducto, Producto, ProductoInput } from '../types/producto'

export const useProductos = (filtros: FiltrosProducto) => useQuery({
  queryKey: ['productos', filtros], queryFn: () => productosApi.listar(filtros),
})

export function useGuardarProducto(producto?: Producto) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductoInput) => {
      if (!producto) return productosApi.crear(data)
      const { categoria_id, stock, disponible, ...campos } = data
      return productosApi.editar(producto.id, {
        ...campos, ...(categoria_id === producto.categoria_id ? {} : { categoria_id }),
      })
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useGuardarStock(id: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (data: StockInput) => productosApi.stock(id, data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useEliminarProducto() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: productosApi.eliminar,
    onSuccess: () => client.invalidateQueries({ queryKey: ['productos'] }),
  })
}
