import { handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { definirSituacao, erroCodigoDuplicado } from '@/lib/api/disciplinas'
import { criarDisciplinaSchema } from '@/lib/api/schemas'

// Adiciona uma disciplina ao aluno, opcionalmente já com a situação.
export const POST = handler(async (request: Request) => {
  const { situacao, ...disciplina } = await parseBody(
    request,
    criarDisciplinaSchema
  )
  const { supabase, user } = await requireUser()

  const { data, error } = await supabase
    .from('disciplinas')
    .insert({
      aluno_id: user.id,
      codigo: disciplina.codigo,
      nome: disciplina.nome,
      carga_horaria: disciplina.cargaHoraria,
      carater: disciplina.carater,
      semestre: disciplina.semestre
    })
    .select('id')
    .single()

  if (error) throw erroCodigoDuplicado(error)

  if (situacao && situacao.status !== 'PENDENTE') {
    try {
      await definirSituacao(supabase, data.id, situacao)
    } catch (err) {
      // Não deixa a disciplina criada pela metade.
      await supabase.from('disciplinas').delete().eq('id', data.id)
      throw err
    }
  }

  return ok({ id: data.id }, 201)
})
