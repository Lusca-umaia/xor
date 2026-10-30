import type { AlterarEmailInput } from '@/lib/api/schemas'
import api from '../api'

// emailPendente vem preenchido quando a troca espera confirmação por link.
export async function alterarEmail(payload: AlterarEmailInput) {
  const response = await api.put<{ emailPendente: string | null }>(
    '/perfil/email',
    payload
  )
  return response.data
}
