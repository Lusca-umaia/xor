import { Query } from '@tanstack/react-query'
import { ErroNaoEncontrado } from '@/services/ambienteEstudo/erros'

const raiz = ['ambienteEstudo'] as const

export const chavesAmbiente = {
  raiz,
  ambientes: () => [...raiz, 'ambientes'] as const,
  ambiente: (id: string) => [...raiz, 'ambiente', id] as const,
  materiais: (ambienteId: string) =>
    [...raiz, 'materiais', ambienteId] as const,
  chats: (ambienteId: string) => [...raiz, 'chats', ambienteId] as const,
  chat: (id: string) => [...raiz, 'chat', id] as const,
  mensagens: (chatId: string) => [...raiz, 'mensagens', chatId] as const,
  resumos: (ambienteId: string) => [...raiz, 'resumos', ambienteId] as const,
  resumo: (id: string) => [...raiz, 'resumo', id] as const,
  atividades: (ambienteId: string) =>
    [...raiz, 'atividades', ambienteId] as const,
  atividade: (id: string) => [...raiz, 'atividade', id] as const,
  tentativasAtividade: (atividadeId: string) =>
    [...raiz, 'tentativasAtividade', atividadeId] as const,
  simulados: (ambienteId: string) =>
    [...raiz, 'simulados', ambienteId] as const,
  simulado: (id: string) => [...raiz, 'simulado', id] as const,
  tentativaSimulado: (id: string) => [...raiz, 'tentativaSimulado', id] as const
}

/** Não insiste em recursos que não existem; tenta de novo outras falhas. */
export const repetirConsulta = (tentativas: number, erro: Error) =>
  !(erro instanceof ErroNaoEncontrado) && tentativas < 2

/**
 * Consulta periódica enquanto houver algo sendo processado (upload, geração,
 * correção). Com o back real, o mesmo mecanismo acompanha jobs assíncronos.
 * Use com `refetchIntervalInBackground: true`: a consulta só existe enquanto
 * algo está pendente e deve continuar se o aluno trocar de aba.
 */
export const consultarEnquanto =
  <T>(pendente: (dados: T) => boolean, intervaloMs = 1000) =>
  (query: Query<T, Error, T, readonly unknown[]>) =>
    query.state.data !== undefined && pendente(query.state.data)
      ? intervaloMs
      : false
