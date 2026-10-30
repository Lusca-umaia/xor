import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { DadosNovaMensagem, MensagemChat } from '@/@types/AmbienteEstudo'
import {
  atualizarChat,
  criarChat,
  enviarMensagem,
  excluirChat,
  listarChats,
  listarMensagens,
  obterChat
} from '@/services/ambienteEstudo/chats'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'
import { chavesAmbiente, repetirConsulta } from './chavesConsulta'
import { useMutacaoAmbiente } from './useMutacaoAmbiente'

export function useChats(ambienteId: string) {
  return useQuery({
    queryKey: chavesAmbiente.chats(ambienteId),
    queryFn: () => listarChats(ambienteId),
    retry: repetirConsulta
  })
}

export function useChat(id: string) {
  return useQuery({
    queryKey: chavesAmbiente.chat(id),
    queryFn: () => obterChat(id),
    retry: repetirConsulta
  })
}

export function useMensagens(chatId: string) {
  return useQuery({
    queryKey: chavesAmbiente.mensagens(chatId),
    queryFn: () => listarMensagens(chatId),
    retry: repetirConsulta
  })
}

export function useCriarChat(ambienteId: string) {
  return useMutacaoAmbiente((dados: Parameters<typeof criarChat>[1]) =>
    criarChat(ambienteId, dados)
  )
}

export function useAtualizarChat() {
  return useMutacaoAmbiente(
    ({
      id,
      dados
    }: {
      id: string
      dados: Parameters<typeof atualizarChat>[1]
    }) => atualizarChat(id, dados)
  )
}

export function useExcluirChat() {
  return useMutacaoAmbiente(excluirChat, { mensagemSucesso: 'Chat excluído.' })
}

/**
 * Envia mensagens e acompanha o streaming da resposta. `pendente` mostra a
 * mensagem do aluno antes de o servidor confirmar; `transmissao` traz o texto
 * do assistente à medida que chega.
 */
export function useEnviarMensagem(chatId: string) {
  const queryClient = useQueryClient()
  const controlador = useRef<AbortController | null>(null)
  const [pendente, setPendente] = useState<DadosNovaMensagem | null>(null)
  const [transmissao, setTransmissao] = useState<{
    mensagemId: string
    texto: string
  } | null>(null)

  const enviar = async (dados: DadosNovaMensagem) => {
    controlador.current = new AbortController()
    setPendente(dados)

    try {
      const { mensagemAluno, mensagemAssistente, fluxo } = await enviarMensagem(
        chatId,
        dados,
        controlador.current.signal
      )
      queryClient.setQueryData<MensagemChat[]>(
        chavesAmbiente.mensagens(chatId),
        (antigas = []) => [...antigas, mensagemAluno, mensagemAssistente]
      )
      setPendente(null)
      setTransmissao({ mensagemId: mensagemAssistente.id, texto: '' })

      for await (const pedaco of fluxo) {
        setTransmissao(
          (atual) => atual && { ...atual, texto: atual.texto + pedaco }
        )
      }
    } catch (erro) {
      toast.error(mensagemDeErro(erro))
    } finally {
      setPendente(null)
      setTransmissao(null)
      controlador.current = null
      queryClient.invalidateQueries({ queryKey: chavesAmbiente.raiz })
    }
  }

  return {
    enviar,
    parar: () => controlador.current?.abort(),
    pendente,
    transmissao,
    ocupado: Boolean(pendente || transmissao)
  }
}
