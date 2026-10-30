import 'server-only'

import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { z } from 'zod'
import type {
  DisciplinaVinculada,
  Questionario,
  QuestionarioResumo,
  Resolucao
} from '@/@types/Questionario'
import { percentual } from '@/utils/questionarios'
import { ApiError } from './http'
import type { questionarioSchema } from './schemas'

interface ResolucaoRow {
  id: number
  acertos: number
  em_branco: number
  total: number
  duracao_segundos: number | null
  criado_em: string
}

interface QuestionarioRow {
  id: number
  titulo: string
  descricao: string | null
  dificuldade: Questionario['dificuldade']
  origem: Questionario['origem']
  criado_em: string
  atualizado_em: string
  disciplina: DisciplinaVinculada | null
}

const COLUNAS_QUESTIONARIO =
  'id, titulo, descricao, dificuldade, origem, criado_em, atualizado_em, disciplina:disciplinas ( id, codigo, nome )'

const COLUNAS_RESOLUCAO =
  'id, acertos, em_branco, total, duracao_segundos, criado_em'

export function mapearResolucao(r: ResolucaoRow): Resolucao {
  return {
    id: r.id,
    acertos: r.acertos,
    emBranco: r.em_branco,
    total: r.total,
    percentual: percentual(r.acertos, r.total),
    duracaoSegundos: r.duracao_segundos,
    criadoEm: r.criado_em
  }
}

function mapearCabecalho(q: QuestionarioRow) {
  return {
    id: q.id,
    titulo: q.titulo,
    descricao: q.descricao,
    dificuldade: q.dificuldade,
    origem: q.origem,
    disciplina: q.disciplina,
    criadoEm: q.criado_em,
    atualizadoEm: q.atualizado_em
  }
}

export async function listarQuestionarios(
  supabase: SupabaseClient,
  user: User
): Promise<QuestionarioResumo[]> {
  const { data, error } = await supabase
    .from('questionarios')
    .select(
      `${COLUNAS_QUESTIONARIO}, questoes ( count ), resolucoes ( ${COLUNAS_RESOLUCAO} )`
    )
    .eq('aluno_id', user.id)
    .order('atualizado_em', { ascending: false })

  if (error) throw error

  const rows = data as unknown as (QuestionarioRow & {
    questoes: { count: number }[]
    resolucoes: ResolucaoRow[]
  })[]

  return rows.map((q) => {
    const resolucoes = q.resolucoes
      .map(mapearResolucao)
      .toSorted((a, b) => b.criadoEm.localeCompare(a.criadoEm))

    return {
      ...mapearCabecalho(q),
      totalQuestoes: q.questoes[0]?.count ?? 0,
      totalResolucoes: resolucoes.length,
      melhorPercentual: resolucoes.length
        ? Math.max(...resolucoes.map((r) => r.percentual))
        : null,
      ultimaResolucao: resolucoes[0] ?? null
    }
  })
}

export async function buscarQuestionario(
  supabase: SupabaseClient,
  user: User,
  id: number
): Promise<Questionario> {
  const { data, error } = await supabase
    .from('questionarios')
    .select(
      `${COLUNAS_QUESTIONARIO}, questoes ( id, enunciado, alternativas, correta, explicacao, ordem ), resolucoes ( ${COLUNAS_RESOLUCAO} )`
    )
    .eq('id', id)
    .eq('aluno_id', user.id)
    .order('ordem', { referencedTable: 'questoes' })
    .order('criado_em', { referencedTable: 'resolucoes', ascending: false })
    .limit(20, { referencedTable: 'resolucoes' })
    .maybeSingle()

  if (error) throw error
  if (!data) throw new ApiError(404, 'Questionário não encontrado')

  const q = data as unknown as QuestionarioRow & {
    questoes: {
      id: number
      enunciado: string
      alternativas: string[]
      correta: number
      explicacao: string | null
    }[]
    resolucoes: ResolucaoRow[]
  }

  return {
    ...mapearCabecalho(q),
    questoes: q.questoes.map(
      ({ id, enunciado, alternativas, correta, explicacao }) => ({
        id,
        enunciado,
        alternativas,
        correta,
        explicacao
      })
    ),
    historico: q.resolucoes.map(mapearResolucao)
  }
}

// Cria (sem id) ou substitui o questionário inteiro em uma transação.
export async function salvarQuestionario(
  supabase: SupabaseClient,
  id: number | null,
  dados: z.infer<typeof questionarioSchema>
): Promise<number> {
  const { data, error } = await supabase.rpc('salvar_questionario', {
    p_questionario: id,
    p_dados: {
      titulo: dados.titulo,
      descricao: dados.descricao,
      disciplina_id: dados.disciplinaId,
      dificuldade: dados.dificuldade,
      origem: dados.origem,
      questoes: dados.questoes
    }
  })

  if (error) {
    if (error.code === 'P0002') {
      throw new ApiError(404, 'Questionário não encontrado')
    }
    // Disciplina inexistente ou de outro aluno.
    if (error.code === '23503') {
      throw new ApiError(422, 'Disciplina não encontrada')
    }
    if (error.code === '23514') {
      throw new ApiError(422, 'Alguma questão tem dados inválidos')
    }
    throw error
  }

  return data as number
}
