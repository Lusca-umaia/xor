import 'server-only'

import { z } from 'zod'
import type { QuestaoGerada } from '@/@types/Questionario'
import { DIFICULDADE_LABEL } from '@/utils/questionarios'
import { ApiError } from './http'
import { type gerarQuestoesSchema, questaoSchema } from './schemas'

// IA local via LM Studio, que expõe uma API compatível com a da OpenAI.
//   LM_STUDIO_URL   ex.: http://localhost:1234/v1
//   LM_STUDIO_MODEL opcional; sem ele, o LM Studio usa o modelo carregado.
// As duas ficam só no servidor (sem o prefixo NEXT_PUBLIC_).
const TEMPO_LIMITE_MS = 180_000

type Parametros = z.infer<typeof gerarQuestoesSchema> & {
  disciplinaNome: string | null
}

const respostaSchema = z.object({ questoes: z.array(questaoSchema).min(1) })

// JSON Schema enviado ao modelo para forçar a saída estruturada.
function jsonSchema(alternativas: number) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['questoes'],
    properties: {
      questoes: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['enunciado', 'alternativas', 'correta', 'explicacao'],
          properties: {
            enunciado: { type: 'string' },
            alternativas: {
              type: 'array',
              items: { type: 'string' },
              minItems: alternativas,
              maxItems: alternativas
            },
            correta: {
              type: 'integer',
              minimum: 0,
              maximum: alternativas - 1
            },
            explicacao: { type: 'string' }
          }
        }
      }
    }
  }
}

function montarPrompt(p: Parametros) {
  const linhas = [
    `Crie ${p.quantidade} questões de múltipla escolha em português do Brasil sobre: ${p.tema}.`,
    p.disciplinaNome && `Disciplina: ${p.disciplinaNome}.`,
    `Dificuldade: ${DIFICULDADE_LABEL[p.dificuldade]}.`,
    `Cada questão deve ter exatamente ${p.alternativas} alternativas, apenas uma correta.`,
    'Varie a posição da alternativa correta entre as questões.',
    'Em "correta", informe o índice da alternativa correta começando em 0.',
    'Em "explicacao", explique em até 3 frases por que a alternativa está correta.',
    p.instrucoes && `Instruções adicionais: ${p.instrucoes}`,
    p.conteudo &&
      `Baseie as questões somente no material abaixo:\n"""\n${p.conteudo}\n"""`
  ]
  return linhas.filter(Boolean).join('\n')
}

// Alguns modelos embrulham o JSON em ```json ... ```.
function extrairJson(texto: string) {
  const bloco = texto.match(/```(?:json)?\s*([\s\S]*?)```/)
  return JSON.parse(bloco ? bloco[1] : texto)
}

export async function gerarQuestoesComIa(
  parametros: Parametros
): Promise<QuestaoGerada[]> {
  const baseUrl = process.env.LM_STUDIO_URL
  if (!baseUrl) {
    throw new ApiError(
      503,
      'A geração com IA ainda não está configurada no servidor'
    )
  }

  let resposta: Response
  try {
    resposta = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
      body: JSON.stringify({
        model: process.env.LM_STUDIO_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'Você é um professor universitário que elabora questões de prova claras, corretas e sem ambiguidade. Responda somente com o JSON pedido.'
          },
          { role: 'user', content: montarPrompt(parametros) }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'questoes',
            strict: true,
            schema: jsonSchema(parametros.alternativas)
          }
        }
      })
    })
  } catch (error) {
    console.error(error)
    throw new ApiError(
      502,
      'Não foi possível falar com a IA. Verifique se o LM Studio está rodando'
    )
  }

  if (!resposta.ok) {
    console.error('LM Studio', resposta.status, await resposta.text())
    throw new ApiError(502, 'A IA não conseguiu gerar as questões')
  }

  const corpo = await resposta.json()
  const conteudo: unknown = corpo?.choices?.[0]?.message?.content

  try {
    const { questoes } = respostaSchema.parse(extrairJson(String(conteudo)))
    return questoes.slice(0, parametros.quantidade)
  } catch (error) {
    console.error('Resposta inválida da IA', error, conteudo)
    throw new ApiError(
      502,
      'A IA respondeu em um formato inesperado. Tente gerar novamente'
    )
  }
}
