import type {
  DadosAcademicos,
  DisciplinaCurriculo,
  TentativaHistorico
} from '@/@types/Academico'
import type { Progresso } from '@/@types/Progresso'
import { CURRICULO_CC } from '../mocks/curriculoCC'

// No banco o período é texto livre (máx. 20 caracteres) e pode faltar; o PDF do SIGAA
// traz "AAAA.S". Só esse formato é usado para inferir o semestre quando ele não existe.
const PERIODO = /^\d{4}\.[12]$/

const prerequisitosCC = new Map(
  CURRICULO_CC.map((d) => [d.codigo, d.prerequisitos])
)

const indiceAbsoluto = (periodo: string) => {
  const [ano, sem] = periodo.split('.').map(Number)
  return ano * 2 + sem - 1
}

const moda = (valores: number[]) => {
  const contagem = new Map<number, number>()
  for (const v of valores) contagem.set(v, (contagem.get(v) ?? 0) + 1)
  return [...contagem.entries()].sort(
    (a, b) => b[1] - a[1] || a[0] - b[0]
  )[0][0]
}

// Converte o progresso do aluno (API) para o formato dos cálculos.
// ordem = semestre do aluno: o `semestre` da tentativa; se faltar, deduzido do período.
export function adaptarProgresso(
  progresso: Progresso
): Omit<DadosAcademicos, 'demonstracao'> {
  const curriculo: DisciplinaCurriculo[] = progresso.disciplinas.map((d) => ({
    codigo: d.codigo,
    nome: d.nome,
    cargaHoraria: d.cargaHoraria,
    semestre: d.semestre ?? 0,
    prerequisitos: prerequisitosCC.get(d.codigo) ?? [],
    carater: d.carater
  }))

  const tentativas = progresso.disciplinas.flatMap((d) =>
    d.tentativas.map((t) => ({
      codigo: d.codigo,
      t,
      periodo:
        t.periodo && PERIODO.test(t.periodo.trim()) ? t.periodo.trim() : null
    }))
  )

  // Âncora: índice absoluto do 1º semestre do aluno, vindo de tentativas com os dois dados.
  const comAmbos = tentativas.filter(
    (x) => x.periodo && (x.t.semestre ?? 0) > 0
  )
  const comPeriodo = tentativas.filter((x) => x.periodo)
  const ancora = comAmbos.length
    ? moda(
        comAmbos.map(
          (x) =>
            indiceAbsoluto(x.periodo as string) - ((x.t.semestre as number) - 1)
        )
      )
    : comPeriodo.length
      ? Math.min(...comPeriodo.map((x) => indiceAbsoluto(x.periodo as string)))
      : null

  let semPeriodo = 0
  const historico = tentativas.map<TentativaHistorico>(
    ({ codigo, t, periodo }) => {
      let ordem = 0
      if ((t.semestre ?? 0) > 0) ordem = t.semestre as number
      else if (periodo && ancora !== null)
        ordem = Math.max(1, indiceAbsoluto(periodo) - ancora + 1)
      if (ordem === 0 && t.status !== 'ANDAMENTO') semPeriodo++
      return {
        codigo,
        periodo: periodo ?? (ordem > 0 ? `${ordem}º semestre` : 'Sem período'),
        ordem,
        status: t.status,
        nota: t.nota
      }
    }
  )

  return { curriculo, historico, semPeriodo }
}
