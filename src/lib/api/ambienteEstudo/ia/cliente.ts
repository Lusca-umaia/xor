import 'server-only'

import { z } from 'zod'
import { ApiError } from '../../http'

// IA local por uma API compatível com a da OpenAI (Ollama ou LM Studio).
//   LM_STUDIO_URL   ex.: http://localhost:11434/v1 (Ollama)
//   LM_STUDIO_MODEL ex.: xor-estudo
// Ficam só no servidor. O tempo limite é longo porque o modelo local é lento.
const TEMPO_LIMITE_MS = 600_000

export interface MensagemIa {
  role: 'system' | 'user' | 'assistant'
  content: string
}

function configuracao() {
  const url = process.env.LM_STUDIO_URL
  if (!url) {
    throw new ApiError(503, 'A IA ainda não está configurada no servidor')
  }
  return { url: url.replace(/\/$/, ''), modelo: process.env.LM_STUDIO_MODEL }
}

async function chamar(corpo: Record<string, unknown>, sinal?: AbortSignal) {
  const { url, modelo } = configuracao()
  const sinais = [AbortSignal.timeout(TEMPO_LIMITE_MS), sinal].filter(
    (item): item is AbortSignal => Boolean(item)
  )

  let resposta: Response
  try {
    resposta = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.any(sinais),
      body: JSON.stringify({ model: modelo, ...corpo })
    })
  } catch (erro) {
    if (sinal?.aborted) throw erro
    console.error('[ia] sem conexão', erro)
    throw new ApiError(
      502,
      'Não foi possível falar com a IA. Verifique se o Ollama está rodando'
    )
  }

  if (!resposta.ok) {
    console.error('[ia]', resposta.status, await resposta.text())
    throw new ApiError(502, 'A IA não conseguiu responder')
  }
  return resposta
}

// Modelo de embeddings (no mesmo servidor da IA).
//   EMBEDDING_MODEL ex.: nomic-embed-text-v2-moe (768 dimensões)
export const DIMENSOES_EMBEDDING = 768
const LOTE_EMBEDDINGS = 32

export const modeloEmbedding = () =>
  process.env.EMBEDDING_MODEL || 'nomic-embed-text-v2-moe'

/**
 * Vetores dos textos, na mesma ordem. Devolve null se o modelo de embeddings
 * não estiver disponível: quem chama cai na busca por palavras.
 */
export async function gerarEmbeddings(
  textos: string[]
): Promise<number[][] | null> {
  const url = process.env.LM_STUDIO_URL?.replace(/\/$/, '')
  if (!url || textos.length === 0) return textos.length ? null : []

  const vetores: number[][] = []
  try {
    for (let inicio = 0; inicio < textos.length; inicio += LOTE_EMBEDDINGS) {
      const resposta = await fetch(`${url}/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
        body: JSON.stringify({
          model: modeloEmbedding(),
          input: textos.slice(inicio, inicio + LOTE_EMBEDDINGS)
        })
      })
      if (!resposta.ok) {
        console.error('[ia] embeddings', resposta.status, await resposta.text())
        return null
      }
      const corpo = (await resposta.json()) as {
        data: { index: number; embedding: number[] }[]
      }
      const lote = [...corpo.data].sort((a, b) => a.index - b.index)
      if (
        lote.some(({ embedding }) => embedding.length !== DIMENSOES_EMBEDDING)
      ) {
        console.error('[ia] embeddings com dimensão inesperada')
        return null
      }
      vetores.push(...lote.map(({ embedding }) => embedding))
    }
  } catch (erro) {
    console.error('[ia] embeddings sem conexão', erro)
    return null
  }
  return vetores
}

// Alguns modelos embrulham o JSON em ```json ... ```.
function extrairJson(texto: string) {
  const bloco = texto.match(/```(?:json)?\s*([\s\S]*?)```/)
  return JSON.parse(bloco ? bloco[1] : texto)
}

interface OpcoesJson<T> {
  sistema: string
  usuario: string
  nome: string
  /** JSON Schema enviado ao modelo para forçar a saída estruturada. */
  schema: Record<string, unknown>
  validar: z.ZodType<T>
  temperatura?: number
}

/** Pede uma resposta em JSON no formato do schema e valida com zod. */
export async function chatJson<T>({
  sistema,
  usuario,
  nome,
  schema,
  validar,
  temperatura = 0.4
}: OpcoesJson<T>): Promise<T> {
  const resposta = await chamar({
    temperature: temperatura,
    messages: [
      { role: 'system', content: sistema },
      { role: 'user', content: usuario }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: nome, strict: true, schema }
    }
  })

  const corpo = await resposta.json()
  const conteudo: unknown = corpo?.choices?.[0]?.message?.content
  try {
    return validar.parse(extrairJson(String(conteudo)))
  } catch (erro) {
    console.error('[ia] resposta inválida', nome, erro, conteudo)
    throw new ApiError(
      502,
      'A IA respondeu em um formato inesperado. Tente gerar novamente'
    )
  }
}

/** Resposta em texto livre, entregue em pedaços à medida que o modelo gera. */
export async function* chatStream(
  mensagens: MensagemIa[],
  sinal?: AbortSignal
): AsyncGenerator<string> {
  const resposta = await chamar({ stream: true, messages: mensagens }, sinal)
  if (!resposta.body) return

  const leitor = resposta.body.getReader()
  const decodificador = new TextDecoder()
  let pendente = ''

  for (;;) {
    const { done, value } = await leitor.read()
    if (done) break
    pendente += decodificador.decode(value, { stream: true })

    // Server-Sent Events: uma linha "data: {...}" por pedaço.
    const linhas = pendente.split('\n')
    pendente = linhas.pop() ?? ''
    for (const linha of linhas) {
      const dado = linha.replace(/^data:\s*/, '').trim()
      if (!dado || dado === '[DONE]' || !linha.startsWith('data:')) continue
      try {
        const pedaco = JSON.parse(dado)?.choices?.[0]?.delta?.content
        if (pedaco) yield pedaco
      } catch {
        // Linha incompleta ou de controle: ignora.
      }
    }
  }
}
