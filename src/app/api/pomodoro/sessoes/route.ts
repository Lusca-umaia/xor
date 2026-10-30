import type { SessaoFoco } from '@/@types/Pomodoro'
import { ApiError, handler, ok, parseBody, requireUser } from '@/lib/api/http'
import { sessaoFocoSchema } from '@/lib/api/schemas'

// Janela de histórico usada nas estatísticas (meta, sequência, semana).
const DIAS_HISTORICO = 120

interface SessaoFocoRow {
  id: number
  disciplina_id: number | null
  tarefa: string | null
  duracao_segundos: number
  iniciada_em: string
  concluida_em: string
}

const paraSessao = (row: SessaoFocoRow): SessaoFoco => ({
  id: row.id,
  disciplinaId: row.disciplina_id,
  tarefa: row.tarefa,
  duracaoSegundos: row.duracao_segundos,
  iniciadaEm: row.iniciada_em,
  concluidaEm: row.concluida_em
})

const COLUNAS =
  'id, disciplina_id, tarefa, duracao_segundos, iniciada_em, concluida_em'

// Sessões de foco recentes do aluno, da mais nova para a mais antiga.
export const GET = handler(async () => {
  const { supabase, user } = await requireUser()
  const desde = new Date(Date.now() - DIAS_HISTORICO * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('sessoes_foco')
    .select(COLUNAS)
    .eq('aluno_id', user.id)
    .gte('iniciada_em', desde.toISOString())
    .order('iniciada_em', { ascending: false })
    .limit(2000)

  if (error) throw error
  return ok(data.map(paraSessao))
})

// Registra um bloco de foco concluído.
export const POST = handler(async (request: Request) => {
  const sessao = await parseBody(request, sessaoFocoSchema)
  const { supabase, user } = await requireUser()

  const { data, error } = await supabase
    .from('sessoes_foco')
    .insert({
      aluno_id: user.id,
      disciplina_id: sessao.disciplinaId,
      tarefa: sessao.tarefa,
      duracao_segundos: sessao.duracaoSegundos,
      iniciada_em: sessao.iniciadaEm,
      concluida_em: sessao.concluidaEm
    })
    .select(COLUNAS)
    .single()

  if (error) {
    if (error.code === '23503') {
      throw new ApiError(422, 'Disciplina não encontrada')
    }
    throw error
  }

  return ok(paraSessao(data), 201)
})
