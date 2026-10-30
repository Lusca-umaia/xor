import 'server-only'

import type {
  AtualizacaoTentativaSimulado,
  ConfigSimulado,
  CorrecaoDiscursiva,
  Questao,
  QuestaoDiscursiva,
  Simulado,
  SimuladoListagem,
  TentativaSimulado
} from '@/@types/AmbienteEstudo'
import { calcularResultadoSimulado } from '@/utils/ambienteEstudo/calcularResultado'
import { ApiError } from '../http'
import { temaDoAmbiente } from './ambientes'
import {
  Contexto,
  exigir,
  tocarAmbiente,
  verificar,
  verificarInsercao
} from './comum'
import { contextoParaGeracao } from './ia/busca'
import { corrigirDiscursiva, gerarQuestoes } from './ia/geracao'
import {
  COLUNAS_SIMULADO,
  COLUNAS_TENTATIVA_SIMULADO,
  mapearSimulado,
  mapearTentativaSimulado,
  SimuladoRow,
  TentativaSimuladoRow
} from './mapeadores'
import { carregarTrechos } from './materiais'
import { executarEmSegundoPlano } from './tarefas'
import { concederXp } from './xp'

/** Tolerância para respostas salvas no último segundo (latência de rede). */
const TOLERANCIA_PRAZO_MS = 3_000
const MENSAGEM_PRAZO =
  'O tempo do simulado acabou. As respostas não podem mais ser alteradas.'

export async function listarSimulados(
  { supabase }: Contexto,
  ambienteId: string
): Promise<SimuladoListagem[]> {
  const { data, error } = await supabase
    .from('simulados')
    .select(COLUNAS_SIMULADO)
    .eq('ambiente_id', ambienteId)
    .order('criado_em', { ascending: false })
  verificar(error)
  const simulados = (data ?? []) as SimuladoRow[]
  if (simulados.length === 0) return []

  const { data: tentativas, error: erroTentativas } = await supabase
    .from('tentativas_simulado')
    .select(COLUNAS_TENTATIVA_SIMULADO)
    .in(
      'simulado_id',
      simulados.map(({ id }) => id)
    )
    .order('iniciada_em', { ascending: false })
  verificar(erroTentativas)
  const linhas = ((tentativas ?? []) as TentativaSimuladoRow[]).map(
    mapearTentativaSimulado
  )

  return simulados.map((row) => ({
    ...mapearSimulado(row),
    tentativas: linhas.filter(({ simuladoId }) => simuladoId === row.id)
  }))
}

async function buscarSimulado(
  { supabase }: Contexto,
  id: string
): Promise<SimuladoRow> {
  const { data, error } = await supabase
    .from('simulados')
    .select(COLUNAS_SIMULADO)
    .eq('id', id)
    .maybeSingle()
  verificar(error)
  return exigir(data as SimuladoRow | null, 'Simulado')
}

export const obterSimulado = async (
  ctx: Contexto,
  id: string
): Promise<Simulado> => mapearSimulado(await buscarSimulado(ctx, id))

async function atualizarSimulado(
  { supabase }: Contexto,
  id: string,
  campos: Record<string, unknown>
) {
  const { error } = await supabase.from('simulados').update(campos).eq('id', id)
  verificar(error)
}

/** Reparte a quantidade entre os tipos pedidos (o resto vai para os primeiros). */
function repartir(quantidade: number, tipos: ConfigSimulado['tiposQuestao']) {
  const base = Math.floor(quantidade / tipos.length)
  const resto = quantidade % tipos.length
  return tipos.map((tipo, i) => ({
    tipo,
    quantidade: base + (i < resto ? 1 : 0)
  }))
}

export async function gerarSimulado(
  ctx: Contexto,
  ambienteId: string,
  dados: { titulo?: string; config: ConfigSimulado }
): Promise<Simulado> {
  const { count, error: erroContagem } = await ctx.supabase
    .from('simulados')
    .select('id', { count: 'exact', head: true })
    .eq('ambiente_id', ambienteId)
  verificar(erroContagem)

  const { data, error } = await ctx.supabase
    .from('simulados')
    .insert({
      aluno_id: ctx.user.id,
      ambiente_id: ambienteId,
      titulo: (dados.titulo?.trim() || `Simulado ${(count ?? 0) + 1}`).slice(
        0,
        200
      ),
      config: dados.config,
      status: 'GERANDO'
    })
    .select(COLUNAS_SIMULADO)
    .single()
  verificarInsercao(error, 'Ambiente')
  const simulado = data as SimuladoRow
  await tocarAmbiente(ctx, ambienteId)

  executarEmSegundoPlano(
    `simulado ${simulado.id}`,
    async () => {
      const { config } = dados
      const [trechos, tema] = await Promise.all([
        carregarTrechos(ctx, config.materialIds),
        temaDoAmbiente(ctx, ambienteId)
      ])
      const contexto = await contextoParaGeracao(ctx, trechos, { tema })

      // Uma chamada por tipo, em sequência (o modelo local atende uma por vez).
      const questoes: Questao[] = []
      for (const parte of repartir(
        config.quantidadeQuestoes,
        config.tiposQuestao
      )) {
        if (parte.quantidade === 0) continue
        questoes.push(
          ...(await gerarQuestoes(parte.tipo, {
            contexto,
            tema,
            quantidade: parte.quantidade,
            dificuldade: config.dificuldade
          }))
        )
      }
      if (!questoes.length)
        throw new ApiError(502, 'A IA não gerou nenhuma questão válida')
      await atualizarSimulado(ctx, simulado.id, { questoes, status: 'PRONTO' })
    },
    (mensagem) =>
      atualizarSimulado(ctx, simulado.id, {
        status: 'ERRO',
        mensagem_erro: mensagem
      })
  )

  return mapearSimulado(simulado)
}

export async function excluirSimulado({ supabase }: Contexto, id: string) {
  const { data, error } = await supabase
    .from('simulados')
    .delete()
    .eq('id', id)
    .select('id')
  verificar(error)
  exigir(data?.[0], 'Simulado')
}

const prazoVencido = (tentativa: TentativaSimuladoRow, folgaMs = 0) =>
  tentativa.prazo_final !== null &&
  Date.now() > new Date(tentativa.prazo_final).getTime() + folgaMs

async function buscarTentativa(
  { supabase }: Contexto,
  id: string
): Promise<TentativaSimuladoRow> {
  const { data, error } = await supabase
    .from('tentativas_simulado')
    .select(COLUNAS_TENTATIVA_SIMULADO)
    .eq('id', id)
    .maybeSingle()
  verificar(error)
  return exigir(data as TentativaSimuladoRow | null, 'Tentativa')
}

async function atualizarTentativa(
  { supabase }: Contexto,
  id: string,
  campos: Record<string, unknown>
): Promise<TentativaSimuladoRow> {
  const { data, error } = await supabase
    .from('tentativas_simulado')
    .update(campos)
    .eq('id', id)
    .select(COLUNAS_TENTATIVA_SIMULADO)
    .single()
  verificar(error)
  return data as TentativaSimuladoRow
}

/**
 * Corrige as objetivas na hora; as discursivas ficam GERANDO e são corrigidas
 * pela IA depois da resposta, recalculando a nota no final.
 */
async function entregar(
  ctx: Contexto,
  tentativa: TentativaSimuladoRow,
  automatica: boolean
): Promise<TentativaSimuladoRow> {
  const simulado = await buscarSimulado(ctx, tentativa.simulado_id)
  const discursivas = simulado.questoes.filter(
    (questao): questao is QuestaoDiscursiva => questao.tipo === 'DISCURSIVA'
  )
  const pendentes: Record<string, CorrecaoDiscursiva> = Object.fromEntries(
    discursivas.map(({ id, rubrica }) => [
      id,
      {
        questaoId: id,
        status: 'GERANDO',
        criterios: [],
        nota: 0,
        notaMaxima: rubrica.reduce((soma, { pontos }) => soma + pontos, 0),
        feedbackGeral: ''
      }
    ])
  )

  const entregue = await atualizarTentativa(ctx, tentativa.id, {
    // Entrega automática registra o horário do prazo, não o da abertura.
    entregue_em:
      automatica && tentativa.prazo_final
        ? tentativa.prazo_final
        : new Date().toISOString(),
    entrega_automatica: automatica,
    resultado: calcularResultadoSimulado(
      simulado.questoes,
      tentativa.respostas,
      pendentes
    )
  })
  await tocarAmbiente(ctx, simulado.ambiente_id)

  // XP: a primeira entrega de cada simulado vale mais que as refeitas. A parte
  // da nota sai quando o resultado fica completo (depois das discursivas).
  const { count: outrasEntregas } = await ctx.supabase
    .from('tentativas_simulado')
    .select('id', { count: 'exact', head: true })
    .eq('simulado_id', simulado.id)
    .not('entregue_em', 'is', null)
    .neq('id', tentativa.id)
  const primeira = (outrasEntregas ?? 0) === 0
  await concederXp(ctx, {
    ambienteId: simulado.ambiente_id,
    tipo: 'SIMULADO',
    referencia: tentativa.id,
    xp: primeira ? 30 : 10
  })
  const xpDaNota = (linha: TentativaSimuladoRow) =>
    concederXp(ctx, {
      ambienteId: simulado.ambiente_id,
      tipo: 'SIMULADO_NOTA',
      referencia: tentativa.id,
      xp: (linha.resultado?.notaFinal ?? 0) * (primeira ? 5 : 2)
    })
  if (!discursivas.length) await xpDaNota(entregue)

  if (discursivas.length) {
    executarEmSegundoPlano(
      `correcao ${tentativa.id}`,
      async () => {
        const corrigidas: Record<string, CorrecaoDiscursiva> = {}
        for (const questao of discursivas) {
          const resposta = tentativa.respostas[questao.id]
          const texto = resposta?.tipo === 'DISCURSIVA' ? resposta.texto : ''
          corrigidas[questao.id] = await corrigirDiscursiva(questao, texto)
        }
        await xpDaNota(
          await atualizarTentativa(ctx, tentativa.id, {
            resultado: calcularResultadoSimulado(
              simulado.questoes,
              tentativa.respostas,
              corrigidas
            )
          })
        )
      },
      async () => {
        // Sem correção da IA: as discursivas ficam com nota zero e um aviso.
        const semCorrecao = Object.fromEntries(
          Object.entries(pendentes).map(([id, correcao]) => [
            id,
            {
              ...correcao,
              status: 'PRONTO' as const,
              feedbackGeral: 'Não foi possível corrigir esta resposta com a IA.'
            }
          ])
        )
        await xpDaNota(
          await atualizarTentativa(ctx, tentativa.id, {
            resultado: calcularResultadoSimulado(
              simulado.questoes,
              tentativa.respostas,
              semCorrecao
            )
          })
        )
      }
    )
  }
  return entregue
}

/** Devolve a tentativa em andamento ou cria outra. O prazo é definido aqui. */
export async function iniciarTentativa(
  ctx: Contexto,
  simuladoId: string
): Promise<TentativaSimulado> {
  const simulado = await buscarSimulado(ctx, simuladoId)
  if (simulado.status !== 'PRONTO')
    throw new ApiError(409, 'O simulado ainda não está pronto')

  const { data, error } = await ctx.supabase
    .from('tentativas_simulado')
    .select(COLUNAS_TENTATIVA_SIMULADO)
    .eq('simulado_id', simuladoId)
    .is('entregue_em', null)
    .order('iniciada_em', { ascending: false })
    .limit(1)
  verificar(error)
  const emAndamento = (data?.[0] ?? null) as TentativaSimuladoRow | null
  if (emAndamento && !prazoVencido(emAndamento))
    return mapearTentativaSimulado(emAndamento)
  if (emAndamento) await entregar(ctx, emAndamento, true)

  const inicio = Date.now()
  const { duracaoMinutos } = simulado.config
  const { data: nova, error: erroInsercao } = await ctx.supabase
    .from('tentativas_simulado')
    .insert({
      aluno_id: ctx.user.id,
      simulado_id: simuladoId,
      iniciada_em: new Date(inicio).toISOString(),
      prazo_final: duracaoMinutos
        ? new Date(inicio + duracaoMinutos * 60_000).toISOString()
        : null
    })
    .select(COLUNAS_TENTATIVA_SIMULADO)
    .single()
  verificar(erroInsercao)
  return mapearTentativaSimulado(nova as TentativaSimuladoRow)
}

/** Ao abrir uma tentativa com prazo vencido, ela é entregue automaticamente. */
export async function obterTentativa(
  ctx: Contexto,
  id: string
): Promise<TentativaSimulado> {
  const tentativa = await buscarTentativa(ctx, id)
  if (!tentativa.entregue_em && prazoVencido(tentativa)) {
    return mapearTentativaSimulado(await entregar(ctx, tentativa, true))
  }
  return mapearTentativaSimulado(tentativa)
}

export async function salvarRespostas(
  ctx: Contexto,
  id: string,
  parcial: AtualizacaoTentativaSimulado
): Promise<TentativaSimulado> {
  const tentativa = await buscarTentativa(ctx, id)
  if (tentativa.entregue_em || prazoVencido(tentativa, TOLERANCIA_PRAZO_MS)) {
    throw new ApiError(409, MENSAGEM_PRAZO)
  }
  const campos: Record<string, unknown> = {}
  if (parcial.respostas) campos.respostas = parcial.respostas
  if (parcial.marcadasParaRevisao) campos.marcadas = parcial.marcadasParaRevisao
  if (parcial.tempoPorQuestaoSeg)
    campos.tempo_por_questao = parcial.tempoPorQuestaoSeg
  return mapearTentativaSimulado(await atualizarTentativa(ctx, id, campos))
}

export async function entregarTentativa(
  ctx: Contexto,
  id: string,
  automatica: boolean
): Promise<TentativaSimulado> {
  const tentativa = await buscarTentativa(ctx, id)
  if (tentativa.entregue_em) return mapearTentativaSimulado(tentativa)
  return mapearTentativaSimulado(await entregar(ctx, tentativa, automatica))
}
