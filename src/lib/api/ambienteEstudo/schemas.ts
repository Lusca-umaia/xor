import 'server-only'

import { z } from 'zod'
import type {
  CorrecaoDiscursiva,
  Questao,
  Resposta,
  TentativaAtividade
} from '@/@types/AmbienteEstudo'
import { ApiError } from '../http'

// Entradas das rotas do Ambiente de Estudo. Estruturas que o próprio aluno
// produz e que ficam só nos dados dele (respostas, questões a refazer) são
// validadas de forma leve: formato geral e limites de tamanho.

const uuid = z.string().uuid()
const listaIds = z.array(uuid).max(100)

/** Lê e valida um id (uuid) de parâmetro de rota. */
export async function lerId<C extends string>(
  params: Promise<Record<C, string>>,
  chave: C
) {
  const valor = (await params)[chave]
  if (!uuid.safeParse(valor).success)
    throw new ApiError(400, 'Identificador inválido')
  return valor
}

const cor = z.enum([
  'cinza',
  'azul',
  'verde',
  'roxo',
  'laranja',
  'rosa',
  'ciano',
  'ambar'
])
const dificuldade = z.enum(['FACIL', 'MEDIA', 'DIFICIL', 'MISTA'])
const tipoQuestao = z.enum([
  'MULTIPLA_ESCOLHA',
  'VERDADEIRO_FALSO',
  'LACUNAS',
  'DISCURSIVA'
])
const objeto = z.record(z.string(), z.unknown())

export const dadosAmbienteSchema = z.object({
  nome: z.string().trim().min(1).max(80),
  descricao: z.string().trim().max(300).nullable(),
  cor,
  disciplinaCodigo: z.string().trim().max(30).nullable()
})

export const atualizarAmbienteSchema = dadosAmbienteSchema
  .partial()
  .extend({ arquivado: z.boolean().optional() })

export const materialTextoSchema = z.object({
  nome: z.string().max(255),
  texto: z.string().min(1).max(100_000)
})

export const renomearSchema = z.object({
  nome: z.string().trim().min(1).max(255)
})

const modo = z.enum(['TUTOR', 'EXPLICACAO'])

export const criarChatSchema = z.object({
  titulo: z.string().max(120).optional(),
  materialIds: listaIds,
  modo
})

export const atualizarChatSchema = z.object({
  titulo: z.string().trim().min(1).max(120).optional(),
  materialIds: listaIds.optional(),
  modo: modo.optional(),
  fixado: z.boolean().optional()
})

export const novaMensagemSchema = z.object({
  conteudo: z.string().max(8_000),
  anexoIds: listaIds,
  pedido: z.enum(['DICA', 'RESPOSTA_COMPLETA']).optional()
})

export const configResumoSchema = z.object({
  materialIds: listaIds,
  formato: z.enum(['TOPICOS', 'CORRIDO', 'GLOSSARIO', 'MAPA_MENTAL']),
  titulo: z.string().max(200).optional(),
  origemChatId: uuid.nullable().optional()
})

export const atualizarResumoSchema = z.object({
  titulo: z.string().max(200).optional(),
  conteudo: z.string().max(100_000).optional()
})

export const configAtividadeSchema = z.object({
  tipo: z.enum([
    'QUIZ',
    'VERDADEIRO_FALSO',
    'LACUNAS',
    'DISCURSIVA',
    'FLASHCARDS'
  ]),
  materialIds: listaIds,
  quantidade: z.number().int().min(1).max(40),
  dificuldade,
  topico: z.string().max(200).nullable().optional(),
  titulo: z.string().max(200).optional(),
  origemChatId: uuid.nullable().optional(),
  origemResumoId: uuid.nullable().optional(),
  questoesBase: z
    .array(objeto)
    .max(60)
    .transform((questoes) => questoes as unknown as Questao[])
    .optional()
})

export const tentativaAtividadeSchema = z
  .object({
    respostas: objeto,
    correcoesDiscursivas: objeto,
    confirmadas: z.array(z.string()).max(200),
    indiceAtual: z.number().int().min(0),
    acertos: z.number().int().min(0),
    total: z.number().int().min(0),
    concluidaEm: z.string().datetime().nullable()
  })
  .transform(
    (tentativa) =>
      tentativa as unknown as Pick<
        TentativaAtividade,
        'confirmadas' | 'indiceAtual' | 'acertos' | 'total' | 'concluidaEm'
      > & {
        respostas: Record<string, Resposta>
        correcoesDiscursivas: Record<string, CorrecaoDiscursiva>
      }
  )

export const avaliacaoFlashcardSchema = z.object({
  avaliacao: z.enum(['DE_NOVO', 'DIFICIL', 'BOM', 'FACIL'])
})

export const textoRespostaSchema = z.object({ texto: z.string().max(20_000) })

export const simuladoSchema = z.object({
  titulo: z.string().max(200).optional(),
  config: z.object({
    materialIds: listaIds,
    quantidadeQuestoes: z.number().int().min(1).max(60),
    tiposQuestao: z.array(tipoQuestao).min(1).max(4),
    dificuldade,
    duracaoMinutos: z.number().int().min(1).max(300).nullable(),
    embaralharOpcoes: z.boolean()
  })
})

export const salvarRespostasSchema = z
  .object({
    respostas: objeto.optional(),
    marcadasParaRevisao: z.array(z.string()).max(200).optional(),
    tempoPorQuestaoSeg: z.record(z.string(), z.number().min(0)).optional()
  })
  .transform(
    (parcial) =>
      parcial as {
        respostas?: Record<string, Resposta>
        marcadasParaRevisao?: string[]
        tempoPorQuestaoSeg?: Record<string, number>
      }
  )

export const entregaSchema = z.object({ automatica: z.boolean() })

export const reporteSchema = z.object({
  alvo: z.object({
    tipo: z.enum(['MENSAGEM', 'RESUMO', 'QUESTAO', 'FLASHCARD', 'CORRECAO']),
    id: z.string().min(1).max(100)
  }),
  motivo: z.enum(['INCORRETO', 'SEM_FONTE', 'ENVIESADO', 'OFENSIVO', 'OUTRO']),
  comentario: z.string().max(2_000).nullable()
})
