import { api } from '../../../shared/api/axiosInstance'
import type { UserPublic } from '../types/usuario'

export const usuariosApi = {
  listar: async () => (await api.get<UserPublic[]>('/admin/usuarios')).data,
  cambiar: async ({ id, disabled }: { id: number; disabled: boolean }) =>
    (await api.post<UserPublic>(`/admin/usuarios/${id}/${disabled ? 'desactivar' : 'activar'}`)).data,
}
