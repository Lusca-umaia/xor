import { Questao, Resposta } from '@/@types/AmbienteEstudo'
import { normalizarTexto } from '@/utils/historicoAcademico'

/** Ignora acentos, caixa, pontuação e espaços: "Log(n)" equivale a "logn". */
export const normalizarResposta = (valor: string) =>
  normalizarTexto(valor).replace(/\s+/g, '')

export interface CorrecaoObjetiva {
  correta: boolean
  /** Só em questões de lacunas: acerto por lacuna. */
  lacunas?: Record<string, boolean>
}

export function respostaPreenchida(questao: Questao, resposta?: Resposta) {
  if (!resposta || resposta.tipo !== questao.tipo) return false

  switch (resposta.tipo) {
    case 'MULTIPLA_ESCOLHA':
      return Boolean(resposta.opcaoId)
    case 'VERDADEIRO_FALSO':
      return typeof resposta.valor === 'boolean'
    case 'LACUNAS':
      return questao.tipo === 'LACUNAS'
        ? questao.lacunas.every(({ id }) => resposta.valores[id]?.trim())
        : false
    case 'DISCURSIVA':
      return resposta.texto.trim().length > 0
  }
}

/**
 * Corrige questões objetivas. Devolve `null` para discursivas, que são
 * corrigidas pelo serviço com base na rubrica.
 */
export function corrigirQuestao(
  questao: Questao,
  resposta?: Resposta
): CorrecaoObjetiva | null {
  switch (questao.tipo) {
    case 'MULTIPLA_ESCOLHA':
      return {
        correta:
          resposta?.tipo === 'MULTIPLA_ESCOLHA' &&
          resposta.opcaoId === questao.opcaoCorretaId
      }
    case 'VERDADEIRO_FALSO':
      return {
        correta:
          resposta?.tipo === 'VERDADEIRO_FALSO' &&
          resposta.valor === questao.resposta
      }
    case 'LACUNAS': {
      const valores = resposta?.tipo === 'LACUNAS' ? resposta.valores : {}
      const lacunas = Object.fromEntries(
        questao.lacunas.map(({ id, respostasAceitas }) => [
          id,
          respostasAceitas
            .map(normalizarResposta)
            .includes(normalizarResposta(valores[id] ?? ''))
        ])
      )
      return { correta: Object.values(lacunas).every(Boolean), lacunas }
    }
    case 'DISCURSIVA':
      return null
  }
}
