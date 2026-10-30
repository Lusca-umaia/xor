import type { SituacaoInput } from '@/lib/api/schemas'
import api from '../api'

export interface DefinirSituacaoPayload {
  disciplinaId: number
  situacao: SituacaoInput
}

export async function definirSituacao({
  disciplinaId,
  situacao
}: DefinirSituacaoPayload) {
  await api.put(`/progresso/disciplinas/${disciplinaId}/situacao`, situacao)
}
