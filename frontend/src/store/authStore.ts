import { isAxiosError } from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../features/auth/api/auth'
import type { UserPublic } from '../features/usuarios/types/usuario'
import { api } from '../shared/api/axiosInstance'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: UserPublic | null
  cargando: boolean
  login: (username: string, password: string) => Promise<UserPublic>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  usuario: null,
  cargando: true,
  login: async (username, password) => {
    await authApi.login(username, password)
    const usuario = await authApi.me()
    queryClient.removeQueries({ queryKey: ['pedidos'] })
    set({ usuario, cargando: false })
    return usuario
  },
  logout: async () => {
    await authApi.logout()
    clearSession()
  },
  checkSession: async () => {
    try {
      set({ usuario: await authApi.me(), cargando: false })
    } catch {
      clearSession()
    }
  },
}), {
  name: 'food-store-auth',
  partialize: (state) => ({ usuario: state.usuario }),
}))

function clearSession() {
  useAuthStore.setState({ usuario: null, cargando: false })
  queryClient.removeQueries({ queryKey: ['pedidos'] })
  queryClient.removeQueries({ queryKey: ['usuarios'] })
}

api.interceptors.response.use((response) => response, (error: unknown) => {
  if (isAxiosError<{ detail?: string }>(error)) {
    const status = error.response?.status
    const path = error.config?.url
    if ((status === 401 && path !== '/auth/token' && path !== '/auth/me') ||
        (status === 400 && error.response?.data.detail === 'Cuenta de usuario desactivada')) {
      clearSession()
    }
  }
  return Promise.reject(error)
})
