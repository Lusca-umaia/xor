import 'server-only'

import type { SupabaseClient, User } from '@supabase/supabase-js'
import type {
  DisciplinaProgresso,
  Me,
  Progresso,
  ResumoProgresso,
  StatusDisciplinaAluno,
  Tentativa
} from '@/@types/Progresso'
import { ApiError } from './http'

interface DisciplinaRow {
  id: number
  codigo: string
  nome: string
  carga_horaria: number
  carater: 'OBRIGATORIA' | 'OPTATIVA'
  semestre: number | null
  tentativas: (Tentativa & { criado_em: string })[]
}

export async function buscarMe(
  supabase: SupabaseClient,
  user: User
): Promise<Me> {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, nome, matricula, semestre_atual, curso_nome, curso_codigo')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new ApiError(404, 'Perfil não encontrado')

  return {
    id: data.id,
    email: user.email ?? '',
    nome: data.nome,
    matricula: data.matricula,
    semestreAtual: data.semestre_atual,
    curso: { nome: data.curso_nome, codigo: data.curso_codigo }
  }
}

const rotuloPeriodo = (t: Tentativa) =>
  t.periodo ?? (t.semestre ? `${t.semestre}º semestre` : null)

// O status exibido é derivado das tentativas: aprovação vence andamento.
// Reprovada ou trancada sem aprovação depois continua pendente.
function statusDaDisciplina(tentativas: Tentativa[]): {
  status: StatusDisciplinaAluno
  nota: number | null
  periodo: string | null
} {
  const aprovada = tentativas.find((t) => t.status === 'APROVADA')
  if (aprovada) {
    return {
      status: 'CONCLUIDA',
      nota: aprovada.nota,
      periodo: rotuloPeriodo(aprovada)
    }
  }

  const andamento = tentativas.find((t) => t.status === 'ANDAMENTO')
  if (andamento) {
    return {
      status: 'ANDAMENTO',
      nota: null,
      periodo: rotuloPeriodo(andamento)
    }
  }

  return { status: 'PENDENTE', nota: null, periodo: null }
}

function calcularResumo(
  disciplinas: DisciplinaProgresso[],
  cargaOptativaExigida: number | null
): ResumoProgresso {
  const obrigatorias = disciplinas.filter((d) => d.carater === 'OBRIGATORIA')
  const obrigatoriasConcluidas = obrigatorias.filter(
    (d) => d.status === 'CONCLUIDA'
  )
  const optativasConcluidas = disciplinas.filter(
    (d) => d.carater === 'OPTATIVA' && d.status === 'CONCLUIDA'
  )

  const soma = (lista: DisciplinaProgresso[]) =>
    lista.reduce((acc, d) => acc + d.cargaHoraria, 0)

  const cargaObrigatoriaTotal = soma(obrigatorias)
  const cargaObrigatoriaConcluida = soma(obrigatoriasConcluidas)
  const cargaOptativaConcluida = soma(optativasConcluidas)
  const cargaTotal = cargaObrigatoriaTotal + (cargaOptativaExigida ?? 0)

  const concluidaComputavel =
    cargaObrigatoriaConcluida +
    Math.min(cargaOptativaConcluida, cargaOptativaExigida ?? 0)

  return {
    obrigatoriasTotal: obrigatorias.length,
    obrigatoriasConcluidas: obrigatoriasConcluidas.length,
    optativasConcluidas: optativasConcluidas.length,
    cargaObrigatoriaTotal,
    cargaObrigatoriaConcluida,
    cargaOptativaExigida,
    cargaOptativaConcluida,
    cargaTotal,
    percentualGeral:
      cargaTotal > 0
        ? Math.round((concluidaComputavel / cargaTotal) * 1000) / 10
        : 0,
    emAndamento: disciplinas.filter((d) => d.status === 'ANDAMENTO').length
  }
}

export async function buscarProgresso(
  supabase: SupabaseClient,
  user: User
): Promise<Progresso> {
  const [aluno, perfilRes, disciplinasRes] = await Promise.all([
    buscarMe(supabase, user),
    supabase
      .from('perfis')
      .select('carga_optativa_exigida')
      .eq('id', user.id)
      .single(),
    supabase
      .from('disciplinas')
      .select(
        'id, codigo, nome, carga_horaria, carater, semestre, tentativas ( id, status, nota, periodo, semestre, criado_em )'
      )
      .eq('aluno_id', user.id)
      .order('semestre', { nullsFirst: false })
      .order('codigo')
  ])

  if (perfilRes.error) throw perfilRes.error
  if (disciplinasRes.error) throw disciplinasRes.error

  const disciplinas = (disciplinasRes.data as DisciplinaRow[]).map((d) => {
    const tentativas: Tentativa[] = d.tentativas
      .toSorted((a, b) => a.criado_em.localeCompare(b.criado_em))
      .map(({ id, status, nota, periodo, semestre }) => ({
        id,
        status,
        nota: nota === null ? null : Number(nota),
        periodo,
        semestre
      }))

    return {
      id: d.id,
      codigo: d.codigo,
      nome: d.nome,
      cargaHoraria: d.carga_horaria,
      carater: d.carater,
      semestre: d.semestre,
      ...statusDaDisciplina(tentativas),
      reprovacoes: tentativas.filter((t) => t.status === 'REPROVADA').length,
      trancamentos: tentativas.filter((t) => t.status === 'TRANCADA').length,
      tentativas
    }
  })

  return {
    aluno,
    disciplinas,
    resumo: calcularResumo(disciplinas, perfilRes.data.carga_optativa_exigida)
  }
}
