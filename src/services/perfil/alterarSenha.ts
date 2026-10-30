import type { AlterarSenhaInput } from '@/lib/api/schemas'
import api from '../api'

export async function alterarSenha(payload: AlterarSenhaInput) {
  await api.put('/perfil/senha', payload)
}
