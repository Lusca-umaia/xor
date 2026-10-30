import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { z } from 'zod'
import { ApiError } from './http'
import type { situacaoSchema } from './schemas'

export async function definirSituacao(
  supabase: SupabaseClient,
  disciplinaId: number,
  { status, nota, periodo }: z.infer<typeof situacaoSchema>
) {
  const { error } = await supabase.rpc('definir_situacao_disciplina', {
    p_disciplina: disciplinaId,
    p_status: status,
    p_nota: nota,
    p_periodo: periodo
  })

  if (error) {
    if (error.code === 'P0001') throw new ApiError(422, error.message)
    throw error
  }
}

export function erroCodigoDuplicado(error: { code?: string }) {
  if (error.code === '23505') {
    return new ApiError(409, 'Você já tem uma disciplina com este código')
  }
  return error
}
