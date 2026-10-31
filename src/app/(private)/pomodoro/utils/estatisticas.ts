import type { SessaoFoco } from '@/@types/Pomodoro'

const DIA_MS = 24 * 60 * 60 * 1000
const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

// Chave do dia no fuso do navegador (ex.: 2026-10-29).
export const chaveDia = (data: Date) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`

const inicioDoDia = (data: Date) =>
  new Date(data.getFullYear(), data.getMonth(), data.getDate())

export interface DiaFoco {
  chave: string
  rotulo: string
  segundos: number
  pomodoros: number
  hoje: boolean
}

export interface ResumoFoco {
  hoje: { pomodoros: number; segundos: number }
  ultimos7Dias: DiaFoco[]
  segundosSemana: number
  sequenciaAtual: number
  melhorSequencia: number
  porDisciplina: { disciplinaId: number | null; segundos: number }[]
  sessoesHoje: SessaoFoco[]
}

export function resumirSessoes(
  sessoes: SessaoFoco[],
  agora = new Date()
): ResumoFoco {
  const porDia = new Map<string, { pomodoros: number; segundos: number }>()
  for (const sessao of sessoes) {
    const chave = chaveDia(new Date(sessao.iniciadaEm))
    const dia = porDia.get(chave) ?? { pomodoros: 0, segundos: 0 }
    dia.pomodoros += 1
    dia.segundos += sessao.duracaoSegundos
    porDia.set(chave, dia)
  }

  const hojeInicio = inicioDoDia(agora)
  const chaveHoje = chaveDia(hojeInicio)

  const ultimos7Dias: DiaFoco[] = Array.from({ length: 7 }, (_, i) => {
    const data = new Date(hojeInicio)
    data.setDate(data.getDate() - (6 - i))
    const chave = chaveDia(data)
    const dia = porDia.get(chave)
    return {
      chave,
      rotulo: DIAS_SEMANA[data.getDay()],
      segundos: dia?.segundos ?? 0,
      pomodoros: dia?.pomodoros ?? 0,
      hoje: chave === chaveHoje
    }
  })

  // A sequência continua viva se hoje ainda não teve foco, mas ontem teve.
  let sequenciaAtual = 0
  const cursor = new Date(hojeInicio)
  if (!porDia.has(chaveHoje)) cursor.setDate(cursor.getDate() - 1)
  while (porDia.has(chaveDia(cursor))) {
    sequenciaAtual += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  let melhorSequencia = 0
  let corrente = 0
  let anterior: Date | null = null
  for (const chave of [...porDia.keys()].sort()) {
    const [ano, mes, dia] = chave.split('-').map(Number)
    const data = new Date(ano, mes - 1, dia)
    // Arredonda para tolerar dias com 23h/25h no horário de verão.
    const consecutivo =
      anterior &&
      Math.round((data.getTime() - anterior.getTime()) / DIA_MS) === 1
    corrente = consecutivo ? corrente + 1 : 1
    melhorSequencia = Math.max(melhorSequencia, corrente)
    anterior = data
  }

  const inicioSemana = new Date(hojeInicio)
  inicioSemana.setDate(inicioSemana.getDate() - 6)
  const sessoesSemana = sessoes.filter(
    ({ iniciadaEm }) => new Date(iniciadaEm) >= inicioSemana
  )

  const segundosPorDisciplina = new Map<number | null, number>()
  for (const { disciplinaId, duracaoSegundos } of sessoesSemana) {
    segundosPorDisciplina.set(
      disciplinaId,
      (segundosPorDisciplina.get(disciplinaId) ?? 0) + duracaoSegundos
    )
  }

  return {
    hoje: porDia.get(chaveHoje) ?? { pomodoros: 0, segundos: 0 },
    ultimos7Dias,
    segundosSemana: ultimos7Dias.reduce((total, d) => total + d.segundos, 0),
    sequenciaAtual,
    melhorSequencia,
    porDisciplina: [...segundosPorDisciplina]
      .map(([disciplinaId, segundos]) => ({ disciplinaId, segundos }))
      .sort((a, b) => b.segundos - a.segundos),
    sessoesHoje: sessoes.filter(
      ({ iniciadaEm }) => chaveDia(new Date(iniciadaEm)) === chaveHoje
    )
  }
}

/**
 * Sequência de estudo da tela inicial: conta o dia que teve foco no pomodoro
 * ou estudo em qualquer ambiente (dias YYYY-MM-DD vindos do servidor).
 */
export function sequenciaDeEstudo(
  sessoes: SessaoFoco[],
  diasAmbientes: string[],
  agora = new Date()
) {
  const dias = new Set([
    ...sessoes.map(({ iniciadaEm }) => chaveDia(new Date(iniciadaEm))),
    ...diasAmbientes
  ])
  const hojeInicio = inicioDoDia(agora)
  const estudouHoje = dias.has(chaveDia(hojeInicio))
  let sequencia = 0
  const cursor = new Date(hojeInicio)
  if (!estudouHoje) cursor.setDate(cursor.getDate() - 1)
  while (dias.has(chaveDia(cursor))) {
    sequencia += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return { sequencia, estudouHoje }
}
