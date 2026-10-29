import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const together = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY ?? '',
  baseURL: 'https://api.together.xyz/v1'
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'O campo "messages" é obrigatório e deve ser um array.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const isValidMessages = messages.every(
      (msg: Message) =>
        msg.role && msg.content && typeof msg.content === 'string'
    )
    if (!isValidMessages) {
      return new Response(
        JSON.stringify({
          error:
            'Mensagens inválidas. Cada mensagem deve ter "role" e "content".'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await streamText({
      model: together('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'),
      system: 'Você é um assistente útil e amigável.',
      messages
    })

    return result.toDataStreamResponse({
      getErrorMessage(error) {
        return error instanceof Error
          ? `Erro: ${error.message}`
          : 'Ocorreu um erro desconhecido.'
      }
    })
  } catch (error) {
    console.error('Erro na API:', error)
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
