import {
  AvaliacaoFlashcard,
  EstadoRevisao,
  Flashcard
} from '@/@types/AmbienteEstudo'

const QUALIDADE: Record<AvaliacaoFlashcard, number> = {
  DE_NOVO: 1,
  DIFICIL: 3,
  BOM: 4,
  FACIL: 5
}

const MINUTO = 60_000
const DIA = 24 * 60 * MINUTO
/** Cartões marcados como "de novo" voltam na mesma sessão. */
const ATRASO_DE_NOVO_MS = 10 * MINUTO

/** Algoritmo SM-2 (SuperMemo 2), com ajuste leve para "difícil" e "fácil". */
export function proximoEstadoRevisao(
  estado: EstadoRevisao,
  avaliacao: AvaliacaoFlashcard,
  referencia = Date.now()
): EstadoRevisao {
  const qualidade = QUALIDADE[avaliacao]
  const facilidade = Math.max(
    1.3,
    estado.facilidade +
      (0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02))
  )

  if (qualidade < 3) {
    return {
      repeticoes: 0,
      intervaloDias: 0,
      facilidade,
      proximaRevisao: new Date(referencia + ATRASO_DE_NOVO_MS).toISOString()
    }
  }

  let intervaloDias: number
  if (estado.repeticoes === 0) intervaloDias = avaliacao === 'FACIL' ? 3 : 1
  else if (estado.repeticoes === 1)
    intervaloDias = avaliacao === 'FACIL' ? 6 : 3
  else intervaloDias = Math.round(estado.intervaloDias * facilidade)

  if (avaliacao === 'DIFICIL')
    intervaloDias = Math.max(1, Math.round(intervaloDias * 0.6))

  return {
    repeticoes: estado.repeticoes + 1,
    intervaloDias,
    facilidade,
    proximaRevisao: new Date(referencia + intervaloDias * DIA).toISOString()
  }
}

export function flashcardPendente(card: Flashcard, referencia = Date.now()) {
  return new Date(card.revisao.proximaRevisao).getTime() <= referencia
}

export function contarPendentes(cards: Flashcard[], referencia = Date.now()) {
  return cards.filter((card) => flashcardPendente(card, referencia)).length
}

/** Texto curto do próximo intervalo, para exibir nos botões de avaliação. */
export function rotuloProximoIntervalo(
  estado: EstadoRevisao,
  avaliacao: AvaliacaoFlashcard
) {
  const { intervaloDias } = proximoEstadoRevisao(estado, avaliacao)
  if (intervaloDias === 0) return '10 min'
  return intervaloDias === 1 ? '1 dia' : `${intervaloDias} dias`
}
