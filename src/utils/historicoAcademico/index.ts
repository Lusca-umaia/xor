import { Curso } from '@/@types/Curso'
import { Disciplina } from '@/@types/Grade'
import { CadeiraHistorico, StatusCadeira } from '@/@types/Historico'
import {
  DisciplinaHistorico,
  ResultadoHistorico
} from '@/utils/extrairHistoricoSigaa'

const PALAVRAS_IGNORADAS = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'a',
  'o',
  'as',
  'os',
  'em',
  'para',
  'com',
  'ao',
  'aos'
])

const NUMEROS_ROMANOS = new Set(['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'])

export function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function normalizarCodigo(codigo: string | null): string {
  return normalizarTexto(codigo ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
}

function tokensDoNome(nome: string): Set<string> {
  return new Set(
    normalizarTexto(nome)
      .split(' ')
      .filter(
        (token) =>
          token &&
          !PALAVRAS_IGNORADAS.has(token) &&
          (token.length > 1 || NUMEROS_ROMANOS.has(token))
      )
  )
}

export function similaridadeNomes(a: string, b: string): number {
  const tokensA = tokensDoNome(a)
  const tokensB = tokensDoNome(b)

  if (tokensA.size === 0 || tokensB.size === 0) return 0

  const intersecao = [...tokensA].filter((token) => tokensB.has(token)).length
  const menor = Math.min(tokensA.size, tokensB.size)
  const maior = Math.max(tokensA.size, tokensB.size)

  if (intersecao === menor && menor >= 2) {
    return 0.75 + 0.2 * (intersecao / maior)
  }

  return intersecao / (tokensA.size + tokensB.size - intersecao)
}

export function encontrarCurso(
  cursos: Curso[],
  nomeCurso: string | null
): Curso | null {
  if (!nomeCurso) return null

  let melhorCurso: Curso | null = null
  let melhorPontuacao = 0

  for (const curso of cursos) {
    const pontuacao = similaridadeNomes(nomeCurso, curso.nome)

    if (pontuacao > melhorPontuacao) {
      melhorCurso = curso
      melhorPontuacao = pontuacao
    }
  }

  return melhorPontuacao >= 0.5 ? melhorCurso : null
}

function numeroDoPeriodo(periodo: string | null): number | null {
  if (!periodo) return null

  const correspondencia = periodo.match(/^(\d{4})\.([12])$/)

  if (!correspondencia) return null

  return Number(correspondencia[1]) * 10 + Number(correspondencia[2])
}

export function calcularSemestreAtual(
  periodoInicial: string | null,
  periodoAtual: string | null
): number | null {
  const inicio = numeroDoPeriodo(periodoInicial)
  const atual = numeroDoPeriodo(periodoAtual)

  if (inicio === null || atual === null) return null

  const anoInicio = Math.floor(inicio / 10)
  const semestreInicio = inicio % 10
  const anoAtual = Math.floor(atual / 10)
  const semestreAtual = atual % 10

  const semestre =
    (anoAtual - anoInicio) * 2 + (semestreAtual - semestreInicio) + 1

  return semestre > 0 ? semestre : null
}

function statusDaDisciplina(
  situacao: string | null,
  categoria: DisciplinaHistorico['categoria']
): StatusCadeira {
  const normalizado = normalizarTexto(situacao ?? '')

  if (categoria === 'em_andamento' || normalizado.includes('matriculado')) {
    return 'ANDAMENTO'
  }

  if (normalizado.includes('reprovado')) return 'REPROVADA'

  if (normalizado.includes('aprovado') || normalizado.includes('dispensado')) {
    return 'CONCLUIDA'
  }

  return 'PENDENTE'
}

function caraterDaDisciplina(
  disciplina: DisciplinaHistorico,
  disciplinaGrade?: Disciplina
): CadeiraHistorico['carater'] {
  if (disciplinaGrade) return disciplinaGrade.carater

  const marcadorOptativo = ['*', '#', '&', '§'].includes(
    disciplina.marcador ?? ''
  )

  const componenteOptativo = normalizarTexto(
    disciplina.tipoComponente ?? ''
  ).includes('optativ')

  return marcadorOptativo || componenteOptativo ? 'OPTATIVA' : 'OBRIGATORIA'
}

function mapearDisciplinasDoCurso(
  historico: ResultadoHistorico,
  curso: Curso | null
): Map<string, Disciplina> {
  const mapa = new Map<string, Disciplina>()

  if (!curso) return mapa

  const disciplinasUsadas = new Set<number>()

  // 1. Primeiro tenta o vínculo exato pelo código da disciplina.
  for (const disciplinaHistorico of historico.disciplinas) {
    const codigo = normalizarCodigo(disciplinaHistorico.codigo)
    const disciplinaGrade = curso.disciplinas.find(
      ({ codigo: codigoGrade }) => normalizarCodigo(codigoGrade) === codigo
    )

    if (disciplinaGrade && !disciplinasUsadas.has(disciplinaGrade.id)) {
      mapa.set(codigo, disciplinaGrade)
      disciplinasUsadas.add(disciplinaGrade.id)
    }
  }

  // 2. Depois tenta pelo nome (útil quando a grade e o histórico usam
  // códigos diferentes para o mesmo componente).
  for (const disciplinaHistorico of historico.disciplinas) {
    const codigo = normalizarCodigo(disciplinaHistorico.codigo)

    if (mapa.has(codigo)) continue

    let melhorDisciplina: Disciplina | null = null
    let melhorPontuacao = 0

    for (const disciplinaGrade of curso.disciplinas) {
      if (disciplinasUsadas.has(disciplinaGrade.id)) continue

      const pontuacao = similaridadeNomes(
        disciplinaHistorico.nome,
        disciplinaGrade.nome
      )

      if (pontuacao > melhorPontuacao) {
        melhorDisciplina = disciplinaGrade
        melhorPontuacao = pontuacao
      }
    }

    if (melhorDisciplina && melhorPontuacao >= 0.6) {
      mapa.set(codigo, melhorDisciplina)
      disciplinasUsadas.add(melhorDisciplina.id)
    }
  }

  return mapa
}

export function criarCadeirasHistorico(
  historico: ResultadoHistorico,
  curso: Curso | null
): CadeiraHistorico[] {
  const disciplinasDoCurso = mapearDisciplinasDoCurso(historico, curso)

  return historico.disciplinas
    .filter(({ categoria }) => categoria !== 'nao_identificada')
    .map((disciplina, indice) => {
      const disciplinaGrade = disciplinasDoCurso.get(
        normalizarCodigo(disciplina.codigo)
      )

      return {
        id: disciplinaGrade?.id ?? -(indice + 1),
        codigo: disciplina.codigo ?? '---',
        nome: disciplina.nome,
        cargaHoraria: disciplina.cargaHoraria ?? 0,
        carater: caraterDaDisciplina(disciplina, disciplinaGrade),
        status: statusDaDisciplina(disciplina.situacao, disciplina.categoria),
        nota: disciplina.nota,
        frequencia: disciplina.frequencia,
        periodo: disciplina.semestre,
        situacao: disciplina.situacao,
        docente: disciplina.docente,
        tipoComponente: disciplina.tipoComponente,
        origem: disciplinaGrade ? 'grade' : 'historico'
      } satisfies CadeiraHistorico
    })
}

export function criarPendenciasHistorico(
  historico: ResultadoHistorico
): CadeiraHistorico[] {
  const codigosNoHistorico = new Set(
    historico.disciplinas.map(({ codigo }) => normalizarCodigo(codigo))
  )

  return historico.pendencias
    .filter(
      ({ matriculado, codigo }) =>
        !matriculado && !codigosNoHistorico.has(normalizarCodigo(codigo))
    )
    .map((pendencia, indice) => ({
      id: -(historico.disciplinas.length + indice + 1),
      codigo: pendencia.codigo,
      nome: pendencia.nome,
      cargaHoraria: pendencia.cargaHoraria ?? 0,
      carater: 'OBRIGATORIA',
      status: 'PENDENTE',
      nota: null,
      frequencia: null,
      periodo: null,
      situacao: 'Pendente',
      docente: null,
      tipoComponente: null,
      origem: 'historico'
    }))
}
