import 'server-only'

import type { Contexto } from '../comum'
import { gerarEmbeddings, modeloEmbedding } from './cliente'
import {
  cabeNoContexto,
  ContextoMontado,
  LIMITE_PADRAO,
  montarContexto,
  palavras,
  TrechoContexto
} from './contexto'
import { listarTopicos } from './geracao'

// Busca híbrida: junta a busca semântica (embeddings no pgvector) com a busca
// por palavras usando Reciprocal Rank Fusion. Sem o modelo de embeddings ou
// sem a migration, fica só a busca por palavras.

// O nomic-embed-text-v2-moe pede um prefixo que diz se o texto é documento ou busca.
const PREFIXO_DOCUMENTO = 'search_document: '
const PREFIXO_CONSULTA = 'search_query: '
const K_RRF = 60
const MAXIMO_POR_PREENCHIMENTO = 400
const MAXIMO_TOPICOS = 6
const MAXIMO_PARTES_RESUMO = 8

/** Formato de texto do pgvector ("[0.1,0.2,...]"), aceito pelo PostgREST. */
export const paraVetor = (vetor: number[]) => JSON.stringify(vetor)

/** Embeddings para gravar junto dos trechos; null se o modelo não respondeu. */
export async function embeddingsDeDocumentos(textos: string[]) {
  const vetores = await gerarEmbeddings(
    textos.map((texto) => PREFIXO_DOCUMENTO + texto)
  )
  return vetores && { vetores, modelo: modeloEmbedding() }
}

/**
 * Gera o embedding dos trechos que ainda não têm (materiais enviados antes da
 * busca semântica ou com outro modelo). Devolve false se não deu para usar a
 * busca semântica.
 */
async function preencherEmbeddings(
  { supabase }: Contexto,
  materialIds: string[]
): Promise<boolean> {
  const modelo = modeloEmbedding()
  const { data, error } = await supabase
    .from('trechos')
    .select('id, texto')
    .in('material_id', materialIds)
    .or(`modelo_embedding.is.null,modelo_embedding.neq."${modelo}"`)
    .limit(MAXIMO_POR_PREENCHIMENTO)
  if (error) {
    // Sem a coluna (migration ainda não aplicada): só palavras.
    console.warn('[busca] embeddings indisponíveis no banco', error.message)
    return false
  }
  const pendentes = (data ?? []) as { id: number; texto: string }[]
  if (pendentes.length === 0) return true

  const resultado = await embeddingsDeDocumentos(
    pendentes.map(({ texto }) => texto)
  )
  if (!resultado) return false

  for (let inicio = 0; inicio < pendentes.length; inicio += 10) {
    const erros = await Promise.all(
      pendentes.slice(inicio, inicio + 10).map(async ({ id }, i) => {
        const { error: erroUpdate } = await supabase
          .from('trechos')
          .update({
            embedding: paraVetor(resultado.vetores[inicio + i]),
            modelo_embedding: resultado.modelo
          })
          .eq('id', id)
        return erroUpdate
      })
    )
    const erro = erros.find(Boolean)
    if (erro) {
      console.warn('[busca] falha ao gravar embeddings', erro.message)
      return false
    }
  }
  return true
}

/** Posição (0 = mais parecido) de cada trecho na busca semântica. */
async function posicoesSemanticas(
  ctx: Contexto,
  materialIds: string[],
  consulta: string
): Promise<Map<number, number> | null> {
  if (!(await preencherEmbeddings(ctx, materialIds))) return null
  const vetor = await gerarEmbeddings([PREFIXO_CONSULTA + consulta])
  if (!vetor) return null

  const { data, error } = await ctx.supabase.rpc('buscar_trechos', {
    p_material_ids: materialIds,
    p_consulta: paraVetor(vetor[0]),
    p_modelo: modeloEmbedding(),
    p_limite: 60
  })
  if (error) {
    console.warn('[busca] falha na busca semântica', error.message)
    return null
  }
  return new Map(
    ((data ?? []) as { id: number }[]).map(({ id }, posicao) => [
      Number(id),
      posicao
    ])
  )
}

/** Posição de cada trecho com alguma palavra em comum com a consulta. */
function posicoesPorPalavras(trechos: TrechoContexto[], consulta: string) {
  const alvo = palavras(consulta)
  return new Map(
    trechos
      .map((trecho) => ({
        id: trecho.id,
        pontos: [...palavras(trecho.texto)].filter((p) => alvo.has(p)).length
      }))
      .filter(({ pontos }) => pontos > 0)
      .sort((a, b) => b.pontos - a.pontos)
      .map(({ id }, posicao) => [id, posicao])
  )
}

/**
 * Ordena os trechos do mais ao menos relevante para a consulta. Trechos que
 * nenhuma das buscas encontrou ficam no fim, na ordem do documento.
 */
export async function ordenarPorRelevancia(
  ctx: Contexto,
  trechos: TrechoContexto[],
  consulta: string
): Promise<TrechoContexto[]> {
  if (trechos.length === 0 || !consulta.trim()) return trechos
  const materialIds = [...new Set(trechos.map((t) => t.materialId))]
  const rankings = [
    await posicoesSemanticas(ctx, materialIds, consulta),
    posicoesPorPalavras(trechos, consulta)
  ].filter((ranking): ranking is Map<number, number> => Boolean(ranking))

  const pontuacao = (trecho: TrechoContexto) =>
    rankings.reduce((soma, ranking) => {
      const posicao = ranking.get(trecho.id)
      return posicao === undefined ? soma : soma + 1 / (K_RRF + posicao + 1)
    }, 0)

  return trechos
    .map((trecho, indice) => ({ trecho, indice, pontos: pontuacao(trecho) }))
    .sort((a, b) => b.pontos - a.pontos || a.indice - b.indice)
    .map(({ trecho }) => trecho)
}

/** Até `quantidade` trechos espalhados pelo material, na ordem original. */
function amostraUniforme<T>(trechos: T[], quantidade: number): T[] {
  if (trechos.length <= quantidade) return trechos
  const passo = trechos.length / quantidade
  return Array.from(
    { length: quantidade },
    (_, i) => trechos[Math.floor(i * passo)]
  )
}

const naOrdemDoDocumento = (
  escolhidos: TrechoContexto[],
  todos: TrechoContexto[]
) => {
  const posicao = new Map(todos.map((t, i) => [t.id, i]))
  return [...escolhidos].sort(
    (a, b) => (posicao.get(a.id) ?? 0) - (posicao.get(b.id) ?? 0)
  )
}

/**
 * Contexto para gerar questões e flashcards:
 * - com tópico, os trechos mais relevantes para ele;
 * - material que cabe no prompt, inteiro;
 * - material longo, a IA lista os assuntos de uma amostra e cada assunto
 *   contribui com os seus trechos mais relevantes, em rodízio.
 */
export async function contextoParaGeracao(
  ctx: Contexto,
  trechos: TrechoContexto[],
  { tema, topico }: { tema: string; topico?: string | null }
): Promise<ContextoMontado> {
  if (topico?.trim())
    return montarContexto(await ordenarPorRelevancia(ctx, trechos, topico))
  if (cabeNoContexto(trechos)) return montarContexto(trechos)

  const amostra = montarContexto(
    amostraUniforme(trechos, 24).map((t) => ({
      ...t,
      texto: t.texto.slice(0, 450)
    }))
  )
  let topicos: string[] = []
  try {
    topicos = await listarTopicos(amostra, tema, MAXIMO_TOPICOS)
  } catch (erro) {
    console.warn('[busca] não deu para listar os tópicos', erro)
  }
  if (topicos.length === 0) return montarContexto(amostraUniforme(trechos, 8))

  const listas = []
  for (const assunto of topicos)
    listas.push(await ordenarPorRelevancia(ctx, trechos, assunto))

  // Rodízio: o melhor trecho de cada assunto, depois o segundo, e assim por
  // diante, até encher o espaço do prompt.
  const escolhidos = new Map<number, TrechoContexto>()
  for (let posicao = 0; posicao < trechos.length; posicao++) {
    for (const lista of listas) {
      const trecho = lista[posicao]
      if (!trecho || escolhidos.has(trecho.id)) continue
      const candidatos = [...escolhidos.values(), trecho]
      if (!cabeNoContexto(candidatos)) {
        return montarContexto(
          naOrdemDoDocumento([...escolhidos.values()], trechos)
        )
      }
      escolhidos.set(trecho.id, trecho)
    }
  }
  return montarContexto(naOrdemDoDocumento([...escolhidos.values()], trechos))
}

/**
 * Divide o material em partes que cabem no prompt, na ordem do documento,
 * para o resumo em etapas. Material muito longo é amostrado por igual.
 */
export function partesParaResumo(trechos: TrechoContexto[]): ContextoMontado[] {
  const partes: TrechoContexto[][] = [[]]
  for (const trecho of trechos) {
    const atual = partes[partes.length - 1]
    if (atual.length && !cabeNoContexto([...atual, trecho], LIMITE_PADRAO))
      partes.push([trecho])
    else atual.push(trecho)
  }
  return amostraUniforme(
    partes.filter((parte) => parte.length),
    MAXIMO_PARTES_RESUMO
  ).map((parte) => montarContexto(parte))
}
