import { isAxiosError } from 'axios'

export function handleApiError(error: unknown): string {
  if (isAxiosError<{ detail?: string | { msg?: string }[] }>(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const messages = detail.map((item) => item.msg).filter(Boolean)
      return messages.join(' · ') || 'Revisá los datos ingresados.'
    }
    if (!error.response) return 'No se pudo conectar con el servidor.'
  }
  return 'Ocurrió un error. Intentá de nuevo.'
}
