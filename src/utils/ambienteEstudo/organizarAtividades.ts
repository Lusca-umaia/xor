import type { AtividadeListagem } from '@/@types/AmbienteEstudo'
import { normalizarTexto } from '@/utils/historicoAcademico'
import { ROTULO_TIPO_ATIVIDADE } from './rotulos'

// Organização da lista de atividades: em que situação cada uma está, um nome
// que diferencie atividades do mesmo tipo e a ordem dentro de cada grupo.

export type SituacaoAtividade =
  | 'GERANDO'
  | 'ERRO'
  | 'ANDAMENTO'
  | 'REVISAR'
  | 'NOVA'
  | 'CONCLUIDA'

export function situacaoDaAtividade(
  atividade: AtividadeListagem
): SituacaoAtividade {
  if (atividade.status === 'GERANDO') return 'GERANDO'
  if (atividade.status === 'ERRO') return 'ERRO'
  if (atividade.tentativaEmAndamento) return 'ANDAMENTO'
  if (atividade.tipo === 'FLASHCARDS') {
    const revisados = atividade.flashcards.some(
      ({ revisao }) => revisao.repeticoes > 0
    )
    if (!revisados) return 'NOVA'
    return atividade.flashcardsPendentes > 0 ? 'REVISAR' : 'CONCLUIDA'
  }
  return atividade.melhorResultado ? 'CONCLUIDA' : 'NOVA'
}

/**
 * Do que a atividade trata: os tópicos das questões (os mais frequentes
 * primeiro) ou, nos flashcards, os materiais citados.
 */
export function assuntosDaAtividade(atividade: AtividadeListagem): string[] {
  const contagem = new Map<string, number>()
  const somar = (texto: string | null | undefined) => {
    const limpo = texto?.trim()
    if (limpo) contagem.set(limpo, (contagem.get(limpo) ?? 0) + 1)
  }
  if (atividade.tipo === 'FLASHCARDS')
    atividade.flashcards.forEach(({ citacoes }) =>
      citacoes.forEach(({ materialNome }) => somar(materialNome))
    )
  else atividade.questoes.forEach(({ topico }) => somar(topico))
  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([assunto]) => assunto)
}

/**
 * Nome para a lista. Atividades antigas foram criadas só com o nome do tipo
 * ("Quiz rápido"); nesse caso o assunto principal entra no nome.
 */
export function nomeDaAtividade(
  atividade: AtividadeListagem,
  assuntos = assuntosDaAtividade(atividade)
) {
  const generico = atividade.titulo === ROTULO_TIPO_ATIVIDADE[atividade.tipo]
  const assunto = atividade.topico?.trim() || assuntos[0]
  return generico && assunto
    ? `${ROTULO_TIPO_ATIVIDADE[atividade.tipo]}: ${assunto}`
    : atividade.titulo
}

/** Proporção de acertos da melhor tentativa (null se nunca concluída). */
export const aproveitamento = (atividade: AtividadeListagem) =>
  atividade.melhorResultado && atividade.melhorResultado.total > 0
    ? atividade.melhorResultado.acertos / atividade.melhorResultado.total
    : null

export type Ordem = 'RECENTES' | 'PIOR_ACERTO' | 'ANTIGAS'

export const ROTULO_ORDEM: Record<Ordem, string> = {
  RECENTES: 'Mais recentes',
  PIOR_ACERTO: 'Menor acerto primeiro',
  ANTIGAS: 'Mais antigas'
}

const dataDeReferencia = (atividade: AtividadeListagem) =>
  atividade.ultimaConclusaoEm ?? atividade.criadoEm

export function ordenar(atividades: AtividadeListagem[], ordem: Ordem) {
  const lista = [...atividades]
  if (ordem === 'PIOR_ACERTO')
    return lista.sort(
      (a, b) =>
        (aproveitamento(a) ?? 2) - (aproveitamento(b) ?? 2) ||
        dataDeReferencia(b).localeCompare(dataDeReferencia(a))
    )
  return lista.sort((a, b) =>
    ordem === 'ANTIGAS'
      ? dataDeReferencia(a).localeCompare(dataDeReferencia(b))
      : dataDeReferencia(b).localeCompare(dataDeReferencia(a))
  )
}

/** Busca pelo nome, pelo tipo e pelos assuntos, sem acento. */
export function casaComBusca(atividade: AtividadeListagem, busca: string) {
  const termo = normalizarTexto(busca.trim())
  if (!termo) return true
  const assuntos = assuntosDaAtividade(atividade)
  return [
    nomeDaAtividade(atividade, assuntos),
    ROTULO_TIPO_ATIVIDADE[atividade.tipo],
    ...assuntos
  ].some((texto) => normalizarTexto(texto).includes(termo))
}
