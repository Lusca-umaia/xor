import { ApiError, handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { buscarProgresso } from '@/lib/api/progresso'
import { encerrarSemestreSchema } from '@/lib/api/schemas'

export const POST = handler(async (request: Request) => {
  const { resultados, proximasDisciplinas } = await parseBody(
    request,
    encerrarSemestreSchema
  )
  const { supabase, user } = await requireUser()

  // A função roda como o próprio aluno (RLS) e em uma única transação.
  const { error } = await supabase.rpc('encerrar_semestre', {
    p_resultados: resultados.map(({ disciplinaId, status, nota }) => ({
      disciplina_id: disciplinaId,
      status,
      nota
    })),
    p_proximas: proximasDisciplinas
  })

  if (error) {
    if (error.code === 'P0001') throw new ApiError(422, error.message)
    throw error
  }

  return ok(await buscarProgresso(supabase, user))
})
