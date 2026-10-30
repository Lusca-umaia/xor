import {
  Chat,
  DadosNovaMensagem,
  MensagemChat,
  ModoChat
} from '@/@types/AmbienteEstudo'
import { exigir } from './erros'
import {
  agora,
  alterarBanco,
  clonar,
  gerarId,
  lerBanco
} from './mock/armazenamento'
import { esperar } from './mock/atraso'
import { gerarRespostaChat, tituloDeTexto } from './mock/geradores'
import {
  materiaisUtilizaveis,
  pacoteDoAmbiente,
  preparar,
  tocarAmbiente
} from './mock/preparar'

const TITULO_PADRAO = 'Novo chat'

const TEXTO_PEDIDO = {
  DICA: '💡 Me dê uma dica',
  RESPOSTA_COMPLETA: 'Mostre a resposta completa'
}

export async function listarChats(ambienteId: string): Promise<Chat[]> {
  await preparar(150, 350)
  return clonar(
    lerBanco()
      .chats.filter((chat) => chat.ambienteId === ambienteId)
      .sort(
        (a, b) =>
          Number(b.fixado) - Number(a.fixado) ||
          b.atualizadoEm.localeCompare(a.atualizadoEm)
      )
  )
}

export async function obterChat(id: string): Promise<Chat> {
  await preparar(100, 250)
  return clonar(
    exigir(
      lerBanco().chats.find((chat) => chat.id === id),
      'Chat'
    )
  )
}

export async function criarChat(
  ambienteId: string,
  dados: { titulo?: string; materialIds: string[]; modo: ModoChat }
): Promise<Chat> {
  await preparar()
  const chat: Chat = {
    id: gerarId(),
    ambienteId,
    titulo: dados.titulo?.trim() || TITULO_PADRAO,
    materialIds: dados.materialIds,
    modo: dados.modo,
    fixado: false,
    criadoEm: agora(),
    atualizadoEm: agora()
  }
  alterarBanco((banco) => {
    banco.chats.push(chat)
    tocarAmbiente(banco, ambienteId)
  })
  return clonar(chat)
}

export async function atualizarChat(
  id: string,
  dados: Partial<Pick<Chat, 'titulo' | 'materialIds' | 'modo' | 'fixado'>>
): Promise<Chat> {
  await preparar(100, 250)
  return clonar(
    alterarBanco((banco) => {
      const chat = exigir(
        banco.chats.find((item) => item.id === id),
        'Chat'
      )
      Object.assign(chat, dados)
      return chat
    })
  )
}

export async function excluirChat(id: string): Promise<void> {
  await preparar()
  alterarBanco((banco) => {
    banco.chats = banco.chats.filter((chat) => chat.id !== id)
    banco.mensagens = banco.mensagens.filter(
      (mensagem) => mensagem.chatId !== id
    )
  })
}

export async function listarMensagens(chatId: string): Promise<MensagemChat[]> {
  await preparar(100, 300)
  return clonar(
    lerBanco()
      .mensagens.filter((mensagem) => mensagem.chatId === chatId)
      .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))
  )
}

export interface EnvioMensagem {
  mensagemAluno: MensagemChat
  mensagemAssistente: MensagemChat
  /** Pedaços da resposta, na ordem em que chegam (streaming). */
  fluxo: AsyncIterable<string>
}

/**
 * Envia uma mensagem e devolve a resposta do assistente em streaming. Os
 * anexos passam a fazer parte do contexto do chat. O `sinal` interrompe a
 * resposta; o texto recebido até ali é mantido.
 */
export async function enviarMensagem(
  chatId: string,
  dados: DadosNovaMensagem,
  sinal?: AbortSignal
): Promise<EnvioMensagem> {
  await preparar(300, 700)

  const { mensagemAluno, mensagemAssistente, resposta } = alterarBanco(
    (banco) => {
      const chat = exigir(
        banco.chats.find(({ id }) => id === chatId),
        'Chat'
      )
      const anteriores = banco.mensagens.filter((m) => m.chatId === chatId)

      chat.materialIds = [...new Set([...chat.materialIds, ...dados.anexoIds])]
      const conteudo =
        dados.conteudo.trim() ||
        (dados.pedido ? TEXTO_PEDIDO[dados.pedido] : '')
      if (anteriores.length === 0 && chat.titulo === TITULO_PADRAO) {
        chat.titulo = tituloDeTexto(conteudo)
      }
      chat.atualizadoEm = agora()
      tocarAmbiente(banco, chat.ambienteId)

      // Cada pergunta nova avança o assunto; dica e resposta completa ficam
      // no assunto da última pergunta.
      const textosPedido = Object.values(TEXTO_PEDIDO)
      const perguntas = anteriores.filter(
        ({ papel, conteudo: texto }) =>
          papel === 'ALUNO' && !textosPedido.includes(texto)
      ).length
      const resposta = gerarRespostaChat(
        pacoteDoAmbiente(banco, chat.ambienteId),
        materiaisUtilizaveis(banco, chat.materialIds),
        {
          modo: chat.modo,
          pedido: dados.pedido,
          indice: dados.pedido ? Math.max(0, perguntas - 1) : perguntas
        }
      )

      const mensagemAluno: MensagemChat = {
        id: gerarId(),
        chatId,
        papel: 'ALUNO',
        conteudo,
        anexoIds: dados.anexoIds,
        citacoes: [],
        foraDoMaterial: false,
        status: 'CONCLUIDA',
        criadoEm: agora()
      }
      const mensagemAssistente: MensagemChat = {
        id: gerarId(),
        chatId,
        papel: 'ASSISTENTE',
        conteudo: '',
        anexoIds: [],
        citacoes: [],
        foraDoMaterial: resposta.foraDoMaterial,
        status: 'TRANSMITINDO',
        criadoEm: new Date(Date.now() + 1).toISOString()
      }
      banco.mensagens.push(mensagemAluno, mensagemAssistente)
      return { mensagemAluno, mensagemAssistente, resposta }
    }
  )

  async function* transmitir() {
    let recebido = ''
    let interrompida = false
    try {
      // Pedaços de até 3 palavras, preservando espaços e quebras de linha.
      const pedacos = resposta.conteudo.match(/(\S+\s*){1,3}/g) ?? []
      for (const pedaco of pedacos) {
        if (sinal?.aborted) {
          interrompida = true
          break
        }
        await esperar(30 + Math.random() * 50)
        recebido += pedaco
        yield pedaco
      }
    } finally {
      alterarBanco((banco) => {
        const salva = banco.mensagens.find(
          ({ id }) => id === mensagemAssistente.id
        )
        if (!salva) return
        salva.conteudo = interrompida
          ? `${recebido.trimEnd()}\n\n*(resposta interrompida)*`
          : recebido
        salva.citacoes = resposta.citacoes
        salva.status = 'CONCLUIDA'
      })
    }
  }

  return {
    mensagemAluno: clonar(mensagemAluno),
    mensagemAssistente: clonar(mensagemAssistente),
    fluxo: transmitir()
  }
}
