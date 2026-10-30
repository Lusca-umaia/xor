import 'server-only'

import type { ConfigResumo, Resumo } from '@/@types/AmbienteEstudo'
import { ROTULO_FORMATO_RESUMO } from '@/utils/ambienteEstudo/rotulos'
import { temaDoAmbiente } from './ambientes'
import {
  Contexto,
  exigir,
  tocarAmbiente,
  verificar,
  verificarInsercao
} from './comum'
import { partesParaResumo } from './ia/busca'
import { cabeNoContexto, montarContexto } from './ia/contexto'
import {
  gerarResumo as gerarConteudoResumo,
  gerarResumoEmEtapas
} from './ia/geracao'
import { COLUNAS_RESUMO, mapearResumo, ResumoRow } from './mapeadores'
import { carregarTrechos } from './materiais'
import { executarEmSegundoPlano } from './tarefas'

export async function listarResumos(
  { supabase }: Contexto,
  ambienteId: string
): Promise<Resumo[]> {
  const { data, error } = await supabase
    .from('resumos')
    .select(COLUNAS_RESUMO)
    .eq('ambiente_id', ambienteId)
    .order('criado_em', { ascending: false })
  verificar(error)
  return ((data ?? []) as ResumoRow[]).map(mapearResumo)
}

export async function obterResumo(
  { supabase }: Contexto,
  id: string
): Promise<Resumo> {
  const { data, error } = await supabase
    .from('resumos')
    .select(COLUNAS_RESUMO)
    .eq('id', id)
    .maybeSingle()
  verificar(error)
  return mapearResumo(exigir(data as ResumoRow | null, 'Resumo'))
}

async function atualizarCampos(
  { supabase }: Contexto,
  id: string,
  campos: Record<string, unknown>
) {
  const { error } = await supabase.from('resumos').update(campos).eq('id', id)
  verificar(error)
}

/** Cria o resumo como GERANDO; o conteúdo é gerado depois da resposta. */
export async function gerarResumo(
  ctx: Contexto,
  ambienteId: string,
  config: ConfigResumo
): Promise<Resumo> {
  let materiais: { nome: string }[] = []
  if (config.materialIds.length) {
    const { data, error } = await ctx.supabase
      .from('materiais')
      .select('nome')
      .in('id', config.materialIds)
    verificar(error)
    materiais = (data ?? []) as { nome: string }[]
  }
  const nomeBase = materiais[0]?.nome.replace(/\.[^.]+$/, '') ?? 'materiais'
  const extras = materiais.length > 1 ? ` e mais ${materiais.length - 1}` : ''

  const { data, error } = await ctx.supabase
    .from('resumos')
    .insert({
      aluno_id: ctx.user.id,
      ambiente_id: ambienteId,
      titulo: (
        config.titulo?.trim() ||
        `${ROTULO_FORMATO_RESUMO[config.formato]} — ${nomeBase}${extras}`
      ).slice(0, 200),
      formato: config.formato,
      material_ids: config.materialIds,
      origem_chat_id: config.origemChatId ?? null,
      status: 'GERANDO'
    })
    .select(COLUNAS_RESUMO)
    .single()
  verificarInsercao(error, 'Ambiente')
  const resumo = data as ResumoRow
  await tocarAmbiente(ctx, ambienteId)

  executarEmSegundoPlano(
    `resumo ${resumo.id}`,
    async () => {
      const [trechos, tema] = await Promise.all([
        carregarTrechos(ctx, config.materialIds),
        temaDoAmbiente(ctx, ambienteId)
      ])
      // Material que não cabe no prompt é resumido em etapas.
      const { conteudo, citacoes } = cabeNoContexto(trechos)
        ? await gerarConteudoResumo(
            montarContexto(trechos),
            tema,
            config.formato
          )
        : await gerarResumoEmEtapas(
            partesParaResumo(trechos),
            tema,
            config.formato
          )
      await atualizarCampos(ctx, resumo.id, {
        conteudo,
        citacoes,
        status: 'PRONTO'
      })
    },
    (mensagem) =>
      atualizarCampos(ctx, resumo.id, {
        status: 'ERRO',
        mensagem_erro: mensagem
      })
  )

  return mapearResumo(resumo)
}

export async function atualizarResumo(
  ctx: Contexto,
  id: string,
  dados: { titulo?: string; conteudo?: string }
): Promise<Resumo> {
  const atual = await obterResumo(ctx, id)
  const campos: Record<string, unknown> = {}
  if (dados.titulo !== undefined && dados.titulo.trim())
    campos.titulo = dados.titulo.trim().slice(0, 200)
  if (dados.conteudo !== undefined && dados.conteudo !== atual.conteudo) {
    campos.conteudo = dados.conteudo
    campos.editado_pelo_aluno = true
  }
  if (Object.keys(campos).length) await atualizarCampos(ctx, id, campos)
  return obterResumo(ctx, id)
}

export async function excluirResumo({ supabase }: Contexto, id: string) {
  const { data, error } = await supabase
    .from('resumos')
    .delete()
    .eq('id', id)
    .select('id')
  verificar(error)
  exigir(data?.[0], 'Resumo')
}
