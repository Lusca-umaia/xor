import {
  Atividade,
  AtividadeListagem,
  AvaliacaoFlashcard,
  ConfigAtividade,
  CorrecaoDiscursiva,
  Flashcard,
  TentativaAtividade
} from '@/@types/AmbienteEstudo'
import api from '../api'
import { dados } from './erros'
import { registrarEventoEstudo } from './eventos'

export const listarAtividades = (ambienteId: string) =>
  dados(api.get<AtividadeListagem[]>(`/ambientes/${ambienteId}/atividades`))

export const obterAtividade = (id: string) =>
  dados(api.get<Atividade>(`/atividades/${id}`))

/**
 * Cria a atividade como GERANDO e a IA gera em seguida. Com `questoesBase`
 * (ex.: refazer só as erradas), fica pronta na hora.
 */
export const gerarAtividade = (ambienteId: string, config: ConfigAtividade) =>
  dados(api.post<Atividade>(`/ambientes/${ambienteId}/atividades`, config))

export const excluirAtividade = async (id: string) => {
  await dados(api.delete(`/atividades/${id}`))
}

export const listarTentativasAtividade = (atividadeId: string) =>
  dados(api.get<TentativaAtividade[]>(`/atividades/${atividadeId}/tentativas`))

/** Nova tentativa; a que estava em andamento é descartada. */
export const iniciarTentativaAtividade = (atividadeId: string) =>
  dados(api.post<TentativaAtividade>(`/atividades/${atividadeId}/tentativas`))

export async function salvarTentativaAtividade(tentativa: TentativaAtividade) {
  const { id, atividadeId, ...estado } = tentativa
  const salva = await dados(
    api.put<TentativaAtividade>(
      `/atividades/${atividadeId}/tentativas/${id}`,
      estado
    )
  )
  if (tentativa.concluidaEm) {
    registrarEventoEstudo('ATIVIDADE_CONCLUIDA', {
      atividadeId,
      acertos: tentativa.acertos,
      total: tentativa.total
    })
  }
  return salva
}

/** Correção formativa por rubrica, feita pela IA no servidor. */
export const corrigirDiscursiva = (questaoId: string, texto: string) =>
  dados(
    api.post<CorrecaoDiscursiva>(`/questoes/${questaoId}/correcoes`, { texto })
  )

export const explicarDeOutroJeito = async (questaoId: string) =>
  (
    await dados(
      api.post<{ explicacao: string }>(`/questoes/${questaoId}/explicacoes`)
    )
  ).explicacao

export async function avaliarFlashcard(
  atividadeId: string,
  flashcardId: string,
  avaliacao: AvaliacaoFlashcard
) {
  const cartao = await dados(
    api.post<Flashcard>(
      `/atividades/${atividadeId}/flashcards/${flashcardId}/revisoes`,
      {
        avaliacao
      }
    )
  )
  registrarEventoEstudo('FLASHCARD_REVISADO', { atividadeId, avaliacao })
  return cartao
}
