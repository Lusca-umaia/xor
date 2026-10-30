import { Progresso } from '@/@types/Progresso'
import type { EncerrarSemestreInput } from '@/lib/api/schemas'
import api from '../api'

// Devolve o progresso já atualizado.
export async function encerrarSemestre(payload: EncerrarSemestreInput) {
  const response = await api.post<Progresso>(
    '/progresso/encerrar-semestre',
    payload
  )
  return response.data
}
