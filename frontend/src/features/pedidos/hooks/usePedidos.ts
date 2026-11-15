import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { pedidosApi } from '../api/pedidos'
import type { FiltrosPedido } from '../types/pedido'

export function usePedidos(filtros: FiltrosPedido) {
  const usuario = useAuthStore((state) => state.usuario)
  return useQuery({
    queryKey: ['pedidos', usuario?.id, 'lista', filtros], queryFn: () => pedidosApi.listar(filtros),
  })
}

export function useDetallePedido(id: number) {
  const usuario = useAuthStore((state) => state.usuario)
  return useQuery({
    queryKey: ['pedidos', usuario?.id, 'detalle', id], queryFn: () => pedidosApi.detalle(id),
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: pedidosApi.resumen })
}

function usePedidoMutation<TData, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: ['pedidos'] }),
      client.invalidateQueries({ queryKey: ['productos'] }),
    ]),
  })
}

export const useCrearPedido = () => usePedidoMutation(pedidosApi.crear)
export const useCambiarEstadoPedido = () => usePedidoMutation(pedidosApi.cambiarEstado)
export const useCancelarPedido = () => usePedidoMutation(pedidosApi.cancelar)
