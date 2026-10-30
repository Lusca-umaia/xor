import {
  Chat,
  DadosNovaMensagem,
  MensagemChat,
  ModoChat
} from '@/@types/AmbienteEstudo'
import api from '../api'
import { dados } from './erros'

export const listarChats = (ambienteId: string) =>
  dados(api.get<Chat[]>(`/ambientes/${ambienteId}/chats`))

export const obterChat = (id: string) => dados(api.get<Chat>(`/chats/${id}`))

export const criarChat = (
  ambienteId: string,
  novo: { titulo?: string; materialIds: string[]; modo: ModoChat }
) => dados(api.post<Chat>(`/ambientes/${ambienteId}/chats`, novo))

export const atualizarChat = (
  id: string,
  campos: Partial<Pick<Chat, 'titulo' | 'materialIds' | 'modo' | 'fixado'>>
) => dados(api.patch<Chat>(`/chats/${id}`, campos))

export const excluirChat = async (id: string) => {
  await dados(api.delete(`/chats/${id}`))
}

export const listarMensagens = (chatId: string) =>
  dados(api.get<MensagemChat[]>(`/chats/${chatId}/mensagens`))

export interface EnvioMensagem {
  mensagemAluno: MensagemChat
  mensagemAssistente: MensagemChat
  /** Pedaços da resposta, na ordem em que chegam (streaming). */
  fluxo: AsyncIterable<string>
}

/**
 * Envia a mensagem e lê a resposta em streaming. Usa fetch porque o axios não
 * lê o corpo aos poucos no navegador. A primeira linha da resposta traz as
 * duas mensagens gravadas; o resto é o texto do assistente.
 */
export async function enviarMensagem(
  chatId: string,
  nova: DadosNovaMensagem,
  sinal?: AbortSignal
): Promise<EnvioMensagem> {
  const resposta = await fetch(`/api/chats/${chatId}/mensagens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nova),
    signal: sinal
  })

  if (!resposta.ok || !resposta.body) {
    const corpo = await resposta.json().catch(() => null)
    if (resposta.status === 401) window.location.assign('/login')
    throw new Error(corpo?.error ?? 'Não foi possível enviar a mensagem.')
  }

  const leitor = resposta.body.getReader()
  const decodificador = new TextDecoder()
  let pendente = ''

  // Lê até o fim da primeira linha (o JSON com as mensagens).
  let quebra = -1
  while (quebra === -1) {
    const { done, value } = await leitor.read()
    if (done) throw new Error('Resposta incompleta do servidor.')
    pendente += decodificador.decode(value, { stream: true })
    quebra = pendente.indexOf('\n')
  }
  const { mensagemAluno, mensagemAssistente } = JSON.parse(
    pendente.slice(0, quebra)
  )
  const inicio = pendente.slice(quebra + 1)

  async function* transmitir() {
    if (inicio) yield inicio
    try {
      for (;;) {
        const { done, value } = await leitor.read()
        if (done) break
        const texto = decodificador.decode(value, { stream: true })
        if (texto) yield texto
      }
    } catch (erro) {
      // Interrompido pelo aluno: o servidor salva o que já tinha chegado.
      if (!sinal?.aborted) throw erro
    }
  }

  return { mensagemAluno, mensagemAssistente, fluxo: transmitir() }
}
