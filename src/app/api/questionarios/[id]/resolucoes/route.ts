import type { ResultadoResolucao } from '@/@types/Questionario'
import {
  ApiError,
  handler,
  ok,
  parseBody,
  parseId,
  requireUser
} from '@/lib/api/http'
import { mapearResolucao } from '@/lib/api/questionarios'
import { resolucaoSchema } from '@/lib/api/schemas'
import { corrigir } from '@/utils/questionarios'

type Contexto = { params: Promise<{ id: string }> }

// Corrige as respostas no servidor e registra a resolução. Questões
// sem resposta contam como em branco.
export const POST = handler(async (request: Request, { params }: Contexto) => {
  const id = await parseId(params)
  const { respostas, duracaoSegundos } = await parseBody(
    request,
    resolucaoSchema
  )
  const { supabase, user } = await requireUser()

  const { data: questoes, error } = await supabase
    .from('questoes')
    .select('id, correta')
    .eq('questionario_id', id)
    .eq('aluno_id', user.id)
    .order('ordem')

  if (error) throw error
  if (!questoes.length) throw new ApiError(404, 'Questionário não encontrado')

  const ids = new Set(questoes.map((q) => q.id))
  if (respostas.some(({ questaoId }) => !ids.has(questaoId))) {
    throw new ApiError(422, 'Resposta para uma questão que não existe')
  }

  const resultado = corrigir(
    questoes,
    Object.fromEntries(respostas.map((r) => [r.questaoId, r.alternativa]))
  )

  const { data: resolucao, error: erroInsert } = await supabase
    .from('resolucoes')
    .insert({
      aluno_id: user.id,
      questionario_id: id,
      acertos: resultado.acertos,
      em_branco: resultado.emBranco,
      total: resultado.total,
      duracao_segundos: duracaoSegundos,
      respostas: resultado.correcao.map((r) => ({
        questao_id: r.questaoId,
        alternativa: r.alternativa,
        correta: r.correta
      }))
    })
    .select('id, acertos, em_branco, total, duracao_segundos, criado_em')
    .single()

  if (erroInsert) throw erroInsert

  const body: ResultadoResolucao = {
    resolucao: mapearResolucao(resolucao),
    correcao: resultado.correcao
  }
  return ok(body, 201)
})
