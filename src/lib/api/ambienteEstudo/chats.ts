import 'server-only'

import type {
  Chat,
  Citacao,
  DadosNovaMensagem,
  MensagemChat,
  ModoChat
} from '@/@types/AmbienteEstudo'
import { temaDoAmbiente } from './ambientes'
import {
  Contexto,
  exigir,
  tocarAmbiente,
  verificar,
  verificarInsercao
} from './comum'
import { chatStream, MensagemIa } from './ia/cliente'
import { ordenarPorRelevancia } from './ia/busca'
import { montarContexto } from './ia/contexto'
import { mensagensChat } from './ia/geracao'
import { concederXp } from './xp'
import {
  ChatRow,
  COLUNAS_CHAT,
  COLUNAS_MENSAGEM,
  mapearChat,
  mapearMensagem,
  MensagemRow
} from './mapeadores'
import { carregarTrechos } from './materiais'

const TITULO_PADRAO = 'Novo chat'
const MENSAGENS_NO_HISTORICO = 10
const TEXTO_PEDIDO = {
  DICA: '💡 Me dê uma dica',
  RESPOSTA_COMPLETA: 'Mostre a resposta completa'
}

export async function listarChats(
  { supabase }: Contexto,
  ambienteId: string
): Promise<Chat[]> {
  const { data, error } = await supabase
    .from('chats')
    .select(COLUNAS_CHAT)
    .eq('ambiente_id', ambienteId)
    .order('fixado', { ascending: false })
    .order('atualizado_em', { ascending: false })
  verificar(error)
  return ((data ?? []) as ChatRow[]).map(mapearChat)
}

async function buscarChat(
  { supabase }: Contexto,
  id: string
): Promise<ChatRow> {
  const { data, error } = await supabase
    .from('chats')
    .select(COLUNAS_CHAT)
    .eq('id', id)
    .maybeSingle()
  verificar(error)
  return exigir(data as ChatRow | null, 'Chat')
}

export const obterChat = async (ctx: Contexto, id: string) =>
  mapearChat(await buscarChat(ctx, id))

export async function criarChat(
  ctx: Contexto,
  ambienteId: string,
  dados: { titulo?: string; materialIds: string[]; modo: ModoChat }
): Promise<Chat> {
  const { data, error } = await ctx.supabase
    .from('chats')
    .insert({
      aluno_id: ctx.user.id,
      ambiente_id: ambienteId,
      titulo: dados.titulo?.trim().slice(0, 120) || TITULO_PADRAO,
      material_ids: dados.materialIds,
      modo: dados.modo
    })
    .select(COLUNAS_CHAT)
    .single()
  verificarInsercao(error, 'Ambiente')
  await tocarAmbiente(ctx, ambienteId)
  return mapearChat(data as ChatRow)
}

export async function atualizarChat(
  { supabase }: Contexto,
  id: string,
  dados: Partial<Pick<Chat, 'titulo' | 'materialIds' | 'modo' | 'fixado'>>
): Promise<Chat> {
  const campos: Record<string, unknown> = {}
  if (dados.titulo !== undefined)
    campos.titulo = dados.titulo.trim().slice(0, 120)
  if (dados.materialIds !== undefined) campos.material_ids = dados.materialIds
  if (dados.modo !== undefined) campos.modo = dados.modo
  if (dados.fixado !== undefined) campos.fixado = dados.fixado

  const { data, error } = await supabase
    .from('chats')
    .update(campos)
    .eq('id', id)
    .select(COLUNAS_CHAT)
    .maybeSingle()
  verificar(error)
  return mapearChat(exigir(data as ChatRow | null, 'Chat'))
}

export async function excluirChat({ supabase }: Contexto, id: string) {
  const { data, error } = await supabase
    .from('chats')
    .delete()
    .eq('id', id)
    .select('id')
  verificar(error)
  exigir(data?.[0], 'Chat')
}

export async function listarMensagens(
  { supabase }: Contexto,
  chatId: string
): Promise<MensagemChat[]> {
  const { data, error } = await supabase
    .from('mensagens')
    .select(COLUNAS_MENSAGEM)
    .eq('chat_id', chatId)
    .order('criado_em')
  verificar(error)
  return ((data ?? []) as MensagemRow[]).map(mapearMensagem)
}

const tituloDeTexto = (texto: string) => {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  if (!limpo) return TITULO_PADRAO
  return limpo.length > 48 ? `${limpo.slice(0, 45).trimEnd()}...` : limpo
}

export interface EnvioMensagem {
  mensagemAluno: MensagemChat
  mensagemAssistente: MensagemChat
  /** Pedaços da resposta à medida que o modelo gera. */
  fluxo: AsyncGenerator<string>
}

/**
 * Grava a mensagem do aluno e a do assistente (TRANSMITINDO) e devolve a
 * resposta em streaming. Ao terminar ou ser interrompida, a mensagem do
 * assistente é salva com o texto recebido até ali.
 */
export async function enviarMensagem(
  ctx: Contexto,
  chatId: string,
  dados: DadosNovaMensagem,
  sinal: AbortSignal
): Promise<EnvioMensagem> {
  const { supabase, user } = ctx
  const chat = await buscarChat(ctx, chatId)

  const { data: anteriores, error: erroHistorico } = await supabase
    .from('mensagens')
    .select(COLUNAS_MENSAGEM)
    .eq('chat_id', chatId)
    .order('criado_em', { ascending: false })
    .limit(MENSAGENS_NO_HISTORICO)
  verificar(erroHistorico)
  const historico = ((anteriores ?? []) as MensagemRow[]).reverse()

  const conteudo =
    dados.conteudo.trim() || (dados.pedido ? TEXTO_PEDIDO[dados.pedido] : '')
  const materialIds = [...new Set([...chat.material_ids, ...dados.anexoIds])]

  const camposChat: Record<string, unknown> = {
    material_ids: materialIds,
    atualizado_em: new Date().toISOString()
  }
  if (historico.length === 0 && chat.titulo === TITULO_PADRAO) {
    camposChat.titulo = tituloDeTexto(conteudo)
  }
  const { error: erroChat } = await supabase
    .from('chats')
    .update(camposChat)
    .eq('id', chatId)
  verificar(erroChat)
  await tocarAmbiente(ctx, chat.ambiente_id)

  // A busca no material usa a última pergunta de verdade (não o texto do pedido).
  const ultimaPergunta = dados.pedido
    ? ([...historico]
        .reverse()
        .find(
          (m) =>
            m.papel === 'ALUNO' &&
            !Object.values(TEXTO_PEDIDO).includes(m.conteudo)
        )?.conteudo ?? conteudo)
    : conteudo
  const [trechos, tema] = await Promise.all([
    carregarTrechos(ctx, materialIds),
    temaDoAmbiente(ctx, chat.ambiente_id)
  ])
  const contexto = montarContexto(
    await ordenarPorRelevancia(ctx, trechos, ultimaPergunta)
  )
  const citacoes = [1, 2, 3]
    .map((n) => contexto.citacaoDe(n))
    .filter((citacao): citacao is Citacao => Boolean(citacao))

  // Num insert de várias linhas, o PostgREST põe null (e não o default) nas
  // colunas que faltam em alguma linha; por isso as duas têm todas as colunas.
  const { data: inseridas, error: erroInsercao } = await supabase
    .from('mensagens')
    .insert([
      {
        aluno_id: user.id,
        chat_id: chatId,
        papel: 'ALUNO',
        conteudo,
        anexo_ids: dados.anexoIds,
        fora_do_material: false,
        status: 'CONCLUIDA'
      },
      {
        aluno_id: user.id,
        chat_id: chatId,
        papel: 'ASSISTENTE',
        conteudo: '',
        anexo_ids: [],
        fora_do_material: !contexto.texto,
        status: 'TRANSMITINDO'
      }
    ])
    .select(COLUNAS_MENSAGEM)
  verificar(erroInsercao)
  const linhas = (inseridas ?? []) as MensagemRow[]
  const mensagemAluno = mapearMensagem(linhas.find((m) => m.papel === 'ALUNO')!)
  const mensagemAssistente = mapearMensagem(
    linhas.find((m) => m.papel === 'ASSISTENTE')!
  )

  const mensagensIa: MensagemIa[] = mensagensChat({
    modo: chat.modo,
    pedido: dados.pedido,
    contexto,
    tema,
    historico: [
      ...historico
        .filter((m) => m.status === 'CONCLUIDA' && m.conteudo.trim())
        .map((m) => ({
          role:
            m.papel === 'ALUNO' ? ('user' as const) : ('assistant' as const),
          content: m.conteudo
        })),
      { role: 'user', content: conteudo }
    ]
  })

  async function* transmitir() {
    let recebido = ''
    let falhou = false
    try {
      for await (const pedaco of chatStream(mensagensIa, sinal)) {
        recebido += pedaco
        yield pedaco
      }
    } catch (erro) {
      if (!sinal.aborted) {
        falhou = true
        console.error('[chat] falha no streaming', erro)
      }
    } finally {
      const interrompida = sinal.aborted
      const texto = interrompida
        ? `${recebido.trimEnd()}\n\n*(resposta interrompida)*`
        : falhou && !recebido
          ? 'Não foi possível falar com a IA agora. Verifique se o Ollama está rodando e tente de novo.'
          : recebido
      const { error } = await supabase
        .from('mensagens')
        .update({
          conteudo: texto.trim(),
          citacoes: contexto.texto ? citacoes : [],
          status: falhou && !recebido ? 'ERRO' : 'CONCLUIDA'
        })
        .eq('id', mensagemAssistente.id)
      if (error) console.error('[chat] salvar resposta', error)
      // XP por resposta completa da IA; chat vazio ou interrompido não conta.
      else if (!falhou && !interrompida && recebido.trim())
        await concederXp(ctx, {
          ambienteId: chat.ambiente_id,
          tipo: 'MENSAGEM',
          referencia: mensagemAssistente.id,
          xp: 2
        })
    }
  }

  return { mensagemAluno, mensagemAssistente, fluxo: transmitir() }
}
