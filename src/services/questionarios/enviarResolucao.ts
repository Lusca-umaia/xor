import { ResultadoResolucao } from '@/@types/Questionario'
import type { ResolucaoInput } from '@/lib/api/schemas'
import api from '../api'

export interface EnviarResolucaoPayload {
  questionarioId: number
  dados: ResolucaoInput
}

export async function enviarResolucao({
  questionarioId,
  dados
}: EnviarResolucaoPayload) {
  const response = await api.post<ResultadoResolucao>(
    `/questionarios/${questionarioId}/resolucoes`,
    dados
  )
  return response.data
}
