import {
  ApiError,
  handler,
  ok,
  parseBody,
  parseId,
  requireUser
} from '@/lib/api/http'
import { erroCodigoDuplicado } from '@/lib/api/disciplinas'
import { novaDisciplinaSchema } from '@/lib/api/schemas'

type Contexto = { params: Promise<{ id: string }> }

// Edita os dados da disciplina (código, nome, carga, caráter, semestre).
export const PATCH = handler(async (request: Request, { params }: Contexto) => {
  const id = await parseId(params)
  const disciplina = await parseBody(request, novaDisciplinaSchema)
  const { supabase, user } = await requireUser()

  const { data, error } = await supabase
    .from('disciplinas')
    .update({
      codigo: disciplina.codigo,
      nome: disciplina.nome,
      carga_horaria: disciplina.cargaHoraria,
      carater: disciplina.carater,
      semestre: disciplina.semestre
    })
    .eq('id', id)
    .eq('aluno_id', user.id)
    .select('id')

  if (error) throw erroCodigoDuplicado(error)
  if (!data.length) throw new ApiError(404, 'Disciplina não encontrada')

  return ok({ success: true })
})

// Exclui a disciplina e todas as tentativas dela.
export const DELETE = handler(
  async (_request: Request, { params }: Contexto) => {
    const id = await parseId(params)
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from('disciplinas')
      .delete()
      .eq('id', id)
      .eq('aluno_id', user.id)
      .select('id')

    if (error) throw error
    if (!data.length) throw new ApiError(404, 'Disciplina não encontrada')

    return ok({ success: true })
  }
)
