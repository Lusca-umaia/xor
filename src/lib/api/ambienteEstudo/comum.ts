import 'server-only'

import type {
  PostgrestError,
  SupabaseClient,
  User
} from '@supabase/supabase-js'
import { ApiError } from '../http'

/** Sessão do aluno usada por todas as funções do Ambiente de Estudo. */
export interface Contexto {
  supabase: SupabaseClient
  user: User
}

/** Lança o erro do Supabase (vira 500 no handler, sem vazar detalhes). */
export function verificar(error: PostgrestError | null) {
  if (error) throw error
}

/**
 * Erro de inserção em tabela filha: FK violada (23503) quer dizer que o pai
 * não existe ou é de outro aluno, então vira 404.
 */
export function verificarInsercao(
  error: PostgrestError | null,
  recursoPai: string
) {
  if (error?.code === '23503') {
    throw new ApiError(404, `${recursoPai} não encontrado(a)`)
  }
  verificar(error)
}

/** Linha que não existe (ou é de outro aluno, barrada pelo RLS) vira 404. */
export function exigir<T>(linha: T | null | undefined, recurso: string): T {
  if (!linha) throw new ApiError(404, `${recurso} não encontrado(a)`)
  return linha
}

/** Atualiza a "última atividade" do ambiente. */
export async function tocarAmbiente(
  { supabase }: Contexto,
  ambienteId: string
) {
  const { error } = await supabase
    .from('ambientes')
    .update({ atualizado_em: new Date().toISOString() })
    .eq('id', ambienteId)
  verificar(error)
}

export const novoId = () => crypto.randomUUID()
