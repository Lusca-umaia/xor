import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import {
  listarQuestionarios,
  salvarQuestionario
} from '@/lib/api/questionarios'
import { questionarioSchema } from '@/lib/api/schemas'

export const GET = handler(async () => {
  const { supabase, user } = await requireUser()
  return ok(await listarQuestionarios(supabase, user))
})

// Cria o questionário já com todas as questões.
export const POST = handler(async (request: Request) => {
  const dados = await parseBody(request, questionarioSchema)
  const { supabase } = await requireUser()

  const id = await salvarQuestionario(supabase, null, dados)
  return ok({ id }, 201)
})
