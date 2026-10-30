import {
  ApiError,
  handler,
  ok,
  parseBody,
  parseId,
  requireUser
} from '@/lib/api/http'
import { buscarQuestionario, salvarQuestionario } from '@/lib/api/questionarios'
import { questionarioSchema } from '@/lib/api/schemas'

type Contexto = { params: Promise<{ id: string }> }

// Questionário com as questões e as últimas resoluções.
export const GET = handler(async (_request: Request, { params }: Contexto) => {
  const id = await parseId(params)
  const { supabase, user } = await requireUser()
  return ok(await buscarQuestionario(supabase, user, id))
})

// Substitui título, dados e todas as questões. O histórico de
// resoluções é mantido.
export const PATCH = handler(async (request: Request, { params }: Contexto) => {
  const id = await parseId(params)
  const dados = await parseBody(request, questionarioSchema)
  const { supabase } = await requireUser()

  await salvarQuestionario(supabase, id, dados)
  return ok({ id })
})

// Exclui o questionário, as questões e as resoluções.
export const DELETE = handler(
  async (_request: Request, { params }: Contexto) => {
    const id = await parseId(params)
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from('questionarios')
      .delete()
      .eq('id', id)
      .eq('aluno_id', user.id)
      .select('id')

    if (error) throw error
    if (!data.length) throw new ApiError(404, 'Questionário não encontrado')

    return ok({ success: true })
  }
)
