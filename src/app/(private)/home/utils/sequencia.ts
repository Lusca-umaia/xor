import type { SessaoFoco } from '@/@types/Pomodoro'
import { chaveDia } from '../../pomodoro/utils/estatisticas'

// Sequência de estudo e média de foco da tela inicial. Um dia conta como
// estudado se teve foco no pomodoro ou estudo em qualquer ambiente (dias
// YYYY-MM-DD vindos do servidor). Tudo no fuso do navegador.

const DIA_MS = 86_400_000
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// Marcos que o aluno persegue; depois do último, a cada 100 dias.
export const MARCOS = [3, 7, 14, 30, 60, 100, 180, 365]

const inicioDoDia = (data: Date) =>
  new Date(data.getFullYear(), data.getMonth(), data.getDate())

const somarDias = (data: Date, dias: number) => {
  const copia = new Date(data)
  copia.setDate(copia.getDate() + dias)
  return copia
}

export function proximoMarco(sequencia: number) {
  const ultimo = MARCOS[MARCOS.length - 1]
  return (
    MARCOS.find((marco) => marco > sequencia) ??
    ultimo + Math.ceil((sequencia + 1 - ultimo) / 100) * 100
  )
}

export interface ResumoSequencia {
  sequencia: number
  estudouHoje: boolean
  recorde: number
  /** Últimos 7 dias, do mais antigo para hoje. */
  semana: { chave: string; rotulo: string; estudou: boolean; hoje: boolean }[]
  proximoMarco: number
  /** Horas inteiras até a meia-noite (para o aviso de sequência em risco). */
  horasAteMeiaNoite: number
}

export function resumirSequencia(
  sessoes: SessaoFoco[],
  diasAmbientes: string[],
  agora = new Date()
): ResumoSequencia {
  const dias = new Set([
    ...sessoes.map(({ iniciadaEm }) => chaveDia(new Date(iniciadaEm))),
    ...diasAmbientes
  ])
  const hoje = inicioDoDia(agora)
  const estudouHoje = dias.has(chaveDia(hoje))

  // Se hoje ainda não teve estudo, a sequência que terminou ontem vale.
  let sequencia = 0
  let cursor = estudouHoje ? hoje : somarDias(hoje, -1)
  while (dias.has(chaveDia(cursor))) {
    sequencia++
    cursor = somarDias(cursor, -1)
  }

  let recorde = 0
  let corrente = 0
  let anterior: Date | null = null
  for (const chave of [...dias].sort()) {
    const [ano, mes, dia] = chave.split('-').map(Number)
    const data = new Date(ano, mes - 1, dia)
    // Arredonda para tolerar dias de 23h/25h no horário de verão.
    const consecutivo =
      anterior &&
      Math.round((data.getTime() - anterior.getTime()) / DIA_MS) === 1
    corrente = consecutivo ? corrente + 1 : 1
    recorde = Math.max(recorde, corrente)
    anterior = data
  }

  const semana = Array.from({ length: 7 }, (_, i) => {
    const data = somarDias(hoje, i - 6)
    const chave = chaveDia(data)
    return {
      chave,
      rotulo: DIAS_SEMANA[data.getDay()],
      estudou: dias.has(chave),
      hoje: i === 6
    }
  })

  return {
    sequencia,
    estudouHoje,
    recorde: Math.max(recorde, sequencia),
    semana,
    proximoMarco: proximoMarco(sequencia),
    horasAteMeiaNoite: Math.ceil(
      (somarDias(hoje, 1).getTime() - agora.getTime()) / 3_600_000
    )
  }
}

export interface MediaFoco {
  /** Minutos de foco por dia nos últimos 7 dias (hoje incluído). */
  minutos: number
  /** A mesma média nos 7 dias antes desses. */
  minutosAnterior: number
  /** Variação em relação à semana anterior (0,25 = +25%); null sem base. */
  variacao: number | null
}

export function mediaDeFoco(
  sessoes: SessaoFoco[],
  agora = new Date()
): MediaFoco {
  const hoje = inicioDoDia(agora)
  const inicioAtual = somarDias(hoje, -6)
  const inicioAnterior = somarDias(hoje, -13)
  let atual = 0
  let passado = 0
  for (const { iniciadaEm, duracaoSegundos } of sessoes) {
    const quando = new Date(iniciadaEm)
    if (quando >= inicioAtual) atual += duracaoSegundos
    else if (quando >= inicioAnterior) passado += duracaoSegundos
  }
  const minutos = Math.round(atual / 60 / 7)
  const minutosAnterior = Math.round(passado / 60 / 7)
  return {
    minutos,
    minutosAnterior,
    variacao: passado > 0 ? (atual - passado) / passado : null
  }
}
