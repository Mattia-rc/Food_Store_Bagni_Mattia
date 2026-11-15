import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '../api/usuarios'

export const useUsuarios = () => useQuery({ queryKey: ['usuarios'], queryFn: usuariosApi.listar })

export function useCambiarUsuario() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: usuariosApi.cambiar,
    onSuccess: () => client.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}
