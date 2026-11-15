import { api } from '../../../shared/api/axiosInstance'
import type { UserPublic } from '../../usuarios/types/usuario'

export interface UserCreate {
  username: string
  full_name: string
  email: string
  password: string
}

export const authApi = {
  register: async (data: UserCreate) => (await api.post<UserPublic>('/auth/register', data)).data,
  login: async (username: string, password: string) => {
    await api.post('/auth/token', new URLSearchParams({ username, password }))
  },
  me: async () => (await api.get<UserPublic>('/auth/me')).data,
  logout: async () => { await api.post('/auth/logout') },
}
