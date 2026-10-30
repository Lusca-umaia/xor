import type {
  Dificuldade,
  Questao,
  RespostaCorrigida
} from '@/@types/Questionario'

export const DIFICULDADE_LABEL: Record<Dificuldade, string> = {
  FACIL: 'Fácil',
  MEDIA: 'Média',
  DIFICIL: 'Difícil'
}

export const DIFICULDADE_OPCOES: { id: Dificuldade; nome: string }[] = [
  { id: 'FACIL', nome: 'Fácil' },
  { id: 'MEDIA', nome: 'Média' },
  { id: 'DIFICIL', nome: 'Difícil' }
]

export const percentual = (acertos: number, total: number) =>
  total > 0 ? Math.round((acertos / total) * 100) : 0

// Usada pela API ao registrar a resolução e pelo cliente no treino
// das questões erradas (que não é registrado).
export function corrigir(
  questoes: Pick<Questao, 'id' | 'correta'>[],
  respostas: Record<number, number | null | undefined>
) {
  const correcao: RespostaCorrigida[] = questoes.map(({ id, correta }) => {
    const alternativa = respostas[id] ?? null
    return {
      questaoId: id,
      alternativa,
      correta,
      acertou: alternativa === correta
    }
  })

  const acertos = correcao.filter((r) => r.acertou).length
  const emBranco = correcao.filter((r) => r.alternativa === null).length

  return {
    correcao,
    acertos,
    emBranco,
    erros: correcao.length - acertos - emBranco,
    total: correcao.length,
    percentual: percentual(acertos, correcao.length)
  }
}

// 754 -> "12min 34s"
export function formatarDuracao(segundos: number | null) {
  if (segundos === null) return '-'
  const h = Math.floor(segundos / 3600)
  const min = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  if (h > 0) return `${h}h ${String(min).padStart(2, '0')}min`
  if (min > 0) return `${min}min ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

// 754 -> "12:34"
export function formatarCronometro(segundos: number) {
  const h = Math.floor(segundos / 3600)
  const min = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0')
  const s = String(segundos % 60).padStart(2, '0')
  return h > 0 ? `${h}:${min}:${s}` : `${min}:${s}`
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Cor da nota: verde a partir de 70%, amarelo a partir de 50%.
export function tomDoPercentual(valor: number) {
  if (valor >= 70) return 'text-emerald-600'
  if (valor >= 50) return 'text-amber-500'
  return 'text-red-500'
}
