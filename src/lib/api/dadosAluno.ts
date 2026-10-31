import 'server-only'

import type { SupabaseClient, User } from '@supabase/supabase-js'
import { CHAVES_SINCRONIZADAS } from '@/services/academico/chaves'
import { ApiError } from './http'

// Dados da vida acadêmica guardados por chave (tabela dados_aluno).

export function validarChave(chave: string) {
  if (!CHAVES_SINCRONIZADAS.includes(chave))
    throw new ApiError(404, 'Chave desconhecida')
  return chave
}

/** Todas as chaves do aluno, num objeto { chave: valor }. */
export async function listarDadosAluno(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('dados_aluno')
    .select('chave, valor')
  if (error) throw error
  return Object.fromEntries(
    ((data ?? []) as { chave: string; valor: unknown }[]).map(
      ({ chave, valor }) => [chave, valor]
    )
  )
}

export async function salvarDadoAluno(
  supabase: SupabaseClient,
  user: User,
  chave: string,
  valor: unknown
) {
  const { error } = await supabase.from('dados_aluno').upsert({
    aluno_id: user.id,
    chave,
    valor,
    atualizado_em: new Date().toISOString()
  })
  if (error) throw error
}

/** Apaga as chaves indicadas (as já validadas) do aluno. */
export async function apagarDadosAluno(
  supabase: SupabaseClient,
  chaves: string[]
) {
  const { error } = await supabase
    .from('dados_aluno')
    .delete()
    .in('chave', chaves)
  if (error) throw error
}
