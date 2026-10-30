import 'server-only'

import type { Material, TipoMaterial } from '@/@types/AmbienteEstudo'
import { ApiError } from '../http'
import {
  Contexto,
  exigir,
  tocarAmbiente,
  verificar,
  verificarInsercao
} from './comum'
import { dividirTexto, extrairTexto, TrechoExtraido } from './extracao'
import { embeddingsDeDocumentos, paraVetor } from './ia/busca'
import type { TrechoContexto } from './ia/contexto'
import { COLUNAS_MATERIAL, MaterialRow, mapearMaterial } from './mapeadores'
import { executarEmSegundoPlano } from './tarefas'
import { concederXp } from './xp'

const BUCKET = 'materiais'
const TAMANHO_MAXIMO_BYTES = 25 * 1024 * 1024
const LIMITE_TEXTO_COLADO = 100_000

const TIPO_POR_EXTENSAO: Record<string, TipoMaterial> = {
  pdf: 'PDF',
  docx: 'DOCX',
  pptx: 'PPTX',
  png: 'IMAGEM',
  jpg: 'IMAGEM',
  jpeg: 'IMAGEM',
  webp: 'IMAGEM',
  txt: 'TEXTO',
  md: 'TEXTO'
}

const tipoDoArquivo = (nome: string): TipoMaterial | null =>
  TIPO_POR_EXTENSAO[nome.split('.').pop()?.toLowerCase() ?? ''] ?? null

// Chaves do Storage aceitam poucos caracteres especiais.
const nomeSeguro = (nome: string) =>
  nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w.-]+/g, '_')
    .slice(-120)

async function gravarTrechos(
  { supabase, user }: Contexto,
  materialId: string,
  trechos: TrechoExtraido[]
) {
  if (trechos.length === 0) return
  const linhas = trechos.map((trecho, ordem) => ({
    aluno_id: user.id,
    material_id: materialId,
    pagina: trecho.pagina,
    ordem,
    texto: trecho.texto
  }))
  // Sem o modelo de embeddings, os vetores são gerados depois, na primeira busca.
  const embeddings = await embeddingsDeDocumentos(
    trechos.map(({ texto }) => texto)
  )
  if (embeddings) {
    const { error } = await supabase.from('trechos').insert(
      linhas.map((linha, i) => ({
        ...linha,
        embedding: paraVetor(embeddings.vetores[i]),
        modelo_embedding: embeddings.modelo
      }))
    )
    if (!error) return
    console.warn('[materiais] trechos gravados sem embedding', error.message)
  }
  const { error } = await supabase.from('trechos').insert(linhas)
  verificar(error)
}

async function atualizarStatus(
  { supabase }: Contexto,
  id: string,
  campos: Partial<
    Pick<MaterialRow, 'status' | 'mensagem_erro' | 'paginas' | 'storage_path'>
  >
) {
  const { error } = await supabase.from('materiais').update(campos).eq('id', id)
  verificar(error)
}

export async function listarMateriais(
  { supabase }: Contexto,
  ambienteId: string
): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materiais')
    .select(COLUNAS_MATERIAL)
    .eq('ambiente_id', ambienteId)
    .order('criado_em', { ascending: false })
  verificar(error)
  return ((data ?? []) as MaterialRow[]).map(mapearMaterial)
}

/**
 * Grava o material e sobe o arquivo. Tipo ou tamanho inválido fica salvo com
 * status ERRO (o front mostra a mensagem). A extração do texto roda depois
 * da resposta; o front acompanha o status por polling.
 */
export async function enviarMaterial(
  ctx: Contexto,
  ambienteId: string,
  arquivo: File,
  origem: Material['origem']
): Promise<Material> {
  const { supabase, user } = ctx
  const tipo = tipoDoArquivo(arquivo.name)
  const mensagemErro = !tipo
    ? 'Formato não suportado. Envie PDF, DOCX, PPTX, imagem ou texto.'
    : arquivo.size > TAMANHO_MAXIMO_BYTES
      ? 'Arquivo maior que 25 MB.'
      : null

  const { data, error } = await supabase
    .from('materiais')
    .insert({
      aluno_id: user.id,
      ambiente_id: ambienteId,
      nome: arquivo.name.slice(0, 255) || 'arquivo',
      tipo: tipo ?? 'PDF',
      tamanho_bytes: arquivo.size,
      status: mensagemErro ? 'ERRO' : 'PROCESSANDO',
      mensagem_erro: mensagemErro,
      origem
    })
    .select(COLUNAS_MATERIAL)
    .single()
  verificarInsercao(error, 'Ambiente')
  const material = data as MaterialRow
  await tocarAmbiente(ctx, ambienteId)
  if (mensagemErro || !tipo) return mapearMaterial(material)

  const bytes = new Uint8Array(await arquivo.arrayBuffer())
  const caminho = `${user.id}/${material.id}/${nomeSeguro(arquivo.name)}`
  const { error: erroUpload } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, bytes, { contentType: arquivo.type || undefined })
  if (erroUpload) {
    console.error('[materiais] upload', erroUpload)
    await atualizarStatus(ctx, material.id, {
      status: 'ERRO',
      mensagem_erro: 'Não foi possível guardar o arquivo. Tente novamente.'
    })
    return mapearMaterial({ ...material, status: 'ERRO' })
  }
  await atualizarStatus(ctx, material.id, { storage_path: caminho })

  executarEmSegundoPlano(
    `extrair ${material.id}`,
    async () => {
      const { trechos, paginas } = await extrairTexto(tipo, bytes)
      await gravarTrechos(ctx, material.id, trechos)
      await atualizarStatus(ctx, material.id, { status: 'PRONTO', paginas })
      await concederXp(ctx, {
        ambienteId,
        tipo: 'MATERIAL',
        referencia: material.id,
        xp: 20
      })
    },
    (mensagem) =>
      atualizarStatus(ctx, material.id, {
        status: 'ERRO',
        mensagem_erro: `Não foi possível ler o conteúdo do arquivo. ${mensagem}`
      })
  )

  return mapearMaterial({ ...material, storage_path: caminho })
}

export async function criarMaterialTexto(
  ctx: Contexto,
  ambienteId: string,
  dados: { nome: string; texto: string }
): Promise<Material> {
  const texto = dados.texto.slice(0, LIMITE_TEXTO_COLADO)
  const { data, error } = await ctx.supabase
    .from('materiais')
    .insert({
      aluno_id: ctx.user.id,
      ambiente_id: ambienteId,
      nome: dados.nome.trim().slice(0, 255) || 'Anotação',
      tipo: 'TEXTO',
      tamanho_bytes: new TextEncoder().encode(texto).length,
      status: 'PRONTO',
      origem: 'UPLOAD',
      conteudo_texto: texto
    })
    .select(COLUNAS_MATERIAL)
    .single()
  verificarInsercao(error, 'Ambiente')
  const material = data as MaterialRow
  await gravarTrechos(ctx, material.id, dividirTexto(texto))
  await tocarAmbiente(ctx, ambienteId)
  await concederXp(ctx, {
    ambienteId,
    tipo: 'MATERIAL',
    referencia: material.id,
    xp: 20
  })
  return mapearMaterial(material)
}

export async function renomearMaterial(
  { supabase }: Contexto,
  id: string,
  nome: string
): Promise<Material> {
  const { data, error } = await supabase
    .from('materiais')
    .update({ nome: nome.trim().slice(0, 255) })
    .eq('id', id)
    .select(COLUNAS_MATERIAL)
    .maybeSingle()
  verificar(error)
  return mapearMaterial(exigir(data as MaterialRow | null, 'Material'))
}

export async function removerArquivos(
  { supabase }: Contexto,
  caminhos: (string | null)[]
) {
  const validos = caminhos.filter((caminho): caminho is string =>
    Boolean(caminho)
  )
  if (validos.length === 0) return
  const { error } = await supabase.storage.from(BUCKET).remove(validos)
  // O registro já foi excluído; arquivo órfão não deve quebrar a operação.
  if (error) console.error('[materiais] remover arquivos', error)
}

/** Exclui o material, o arquivo e a referência a ele nos chats. */
export async function excluirMaterial(ctx: Contexto, id: string) {
  const { supabase } = ctx
  const { data, error } = await supabase
    .from('materiais')
    .delete()
    .eq('id', id)
    .select('storage_path')
  verificar(error)
  const material = exigir(data?.[0], 'Material')

  const { data: chats, error: erroChats } = await supabase
    .from('chats')
    .select('id, material_ids')
    .contains('material_ids', [id])
  verificar(erroChats)
  for (const chat of (chats ?? []) as {
    id: string
    material_ids: string[]
  }[]) {
    const { error: erroAtualizacao } = await supabase
      .from('chats')
      .update({
        material_ids: chat.material_ids.filter(
          (materialId) => materialId !== id
        )
      })
      .eq('id', chat.id)
    verificar(erroAtualizacao)
  }

  await removerArquivos(ctx, [material.storage_path as string | null])
}

/** URL assinada e temporária para visualizar o arquivo original. */
export async function urlDoArquivo({ supabase }: Contexto, id: string) {
  const { data, error } = await supabase
    .from('materiais')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle()
  verificar(error)
  const caminho = exigir(data, 'Material').storage_path as string | null
  if (!caminho) throw new ApiError(404, 'Este material não tem arquivo')

  const { data: assinada, error: erroAssinatura } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(caminho, 60)
  if (erroAssinatura || !assinada) {
    console.error('[materiais] url assinada', erroAssinatura)
    throw new ApiError(404, 'Arquivo não encontrado')
  }
  return assinada.signedUrl
}

/** Trechos dos materiais prontos, na ordem, para montar o contexto da IA. */
export async function carregarTrechos(
  { supabase }: Contexto,
  materialIds: string[]
): Promise<TrechoContexto[]> {
  if (materialIds.length === 0) return []
  const { data: materiais, error } = await supabase
    .from('materiais')
    .select('id, nome')
    .in('id', materialIds)
    .eq('status', 'PRONTO')
  verificar(error)
  if (!materiais?.length) return []

  const nomes = new Map(
    materiais.map(({ id, nome }) => [id as string, nome as string])
  )
  const { data: trechos, error: erroTrechos } = await supabase
    .from('trechos')
    .select('id, material_id, pagina, ordem, texto')
    .in('material_id', [...nomes.keys()])
    .order('ordem')
  verificar(erroTrechos)

  // Mantém a ordem dos materiais escolhidos.
  const ordemMaterial = new Map(materialIds.map((id, indice) => [id, indice]))
  return (
    (trechos ?? []) as {
      id: number
      material_id: string
      pagina: number | null
      texto: string
    }[]
  )
    .sort(
      (a, b) =>
        (ordemMaterial.get(a.material_id) ?? 0) -
        (ordemMaterial.get(b.material_id) ?? 0)
    )
    .map((trecho) => ({
      id: Number(trecho.id),
      materialId: trecho.material_id,
      materialNome: nomes.get(trecho.material_id) ?? 'Material',
      pagina: trecho.pagina,
      texto: trecho.texto
    }))
}
