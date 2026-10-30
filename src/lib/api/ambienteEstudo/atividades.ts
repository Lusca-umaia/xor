import 'server-only'

import type {
  Atividade,
  AtividadeListagem,
  AvaliacaoFlashcard,
  ConfigAtividade,
  CorrecaoDiscursiva,
  Flashcard,
  Questao,
  TentativaAtividade
} from '@/@types/AmbienteEstudo'
import {
  contarPendentes,
  proximoEstadoRevisao
} from '@/utils/ambienteEstudo/revisaoEspacada'
import {
  ROTULO_TIPO_ATIVIDADE,
  TIPO_QUESTAO_DA_ATIVIDADE
} from '@/utils/ambienteEstudo/rotulos'
import { ApiError } from '../http'
import { temaDoAmbiente } from './ambientes'
import {
  Contexto,
  exigir,
  novoId,
  tocarAmbiente,
  verificar,
  verificarInsercao
} from './comum'
import { contextoParaGeracao } from './ia/busca'
import {
  corrigirDiscursiva as corrigirComIa,
  explicarDeOutroJeito as explicarComIa,
  gerarFlashcards,
  gerarQuestoes
} from './ia/geracao'
import {
  AtividadeRow,
  COLUNAS_ATIVIDADE,
  COLUNAS_TENTATIVA_ATIVIDADE,
  mapearAtividade,
  mapearTentativaAtividade,
  TentativaAtividadeRow
} from './mapeadores'
import { carregarTrechos } from './materiais'
import { executarEmSegundoPlano } from './tarefas'

export async function listarAtividades(
  { supabase }: Contexto,
  ambienteId: string
): Promise<AtividadeListagem[]> {
  const { data, error } = await supabase
    .from('atividades')
    .select(COLUNAS_ATIVIDADE)
    .eq('ambiente_id', ambienteId)
    .order('criado_em', { ascending: false })
  verificar(error)
  const atividades = (data ?? []) as AtividadeRow[]
  if (atividades.length === 0) return []

  const { data: tentativas, error: erroTentativas } = await supabase
    .from('tentativas_atividade')
    .select('atividade_id, acertos, total, concluida_em')
    .in(
      'atividade_id',
      atividades.map(({ id }) => id)
    )
  verificar(erroTentativas)
  const linhas = (tentativas ?? []) as Pick<
    TentativaAtividadeRow,
    'atividade_id' | 'acertos' | 'total' | 'concluida_em'
  >[]

  return atividades.map((row) => {
    const daAtividade = linhas.filter(
      ({ atividade_id }) => atividade_id === row.id
    )
    const melhor = daAtividade
      .filter(({ concluida_em }) => concluida_em)
      .sort((a, b) => b.acertos - a.acertos)[0]
    return {
      ...mapearAtividade(row),
      melhorResultado: melhor
        ? { acertos: melhor.acertos, total: melhor.total }
        : null,
      tentativaEmAndamento: daAtividade.some(
        ({ concluida_em }) => !concluida_em
      ),
      flashcardsPendentes: contarPendentes(row.flashcards ?? [])
    }
  })
}

async function buscarAtividade(
  { supabase }: Contexto,
  id: string
): Promise<AtividadeRow> {
  const { data, error } = await supabase
    .from('atividades')
    .select(COLUNAS_ATIVIDADE)
    .eq('id', id)
    .maybeSingle()
  verificar(error)
  return exigir(data as AtividadeRow | null, 'Atividade')
}

export const obterAtividade = async (
  ctx: Contexto,
  id: string
): Promise<Atividade> => mapearAtividade(await buscarAtividade(ctx, id))

async function atualizarAtividade(
  { supabase }: Contexto,
  id: string,
  campos: Record<string, unknown>
) {
  const { error } = await supabase
    .from('atividades')
    .update(campos)
    .eq('id', id)
  verificar(error)
}

/**
 * Cria a atividade como GERANDO e gera depois da resposta. Com
 * `questoesBase` (refazer só as erradas), fica pronta na hora.
 */
export async function gerarAtividade(
  ctx: Contexto,
  ambienteId: string,
  config: ConfigAtividade
): Promise<Atividade> {
  const base = config.questoesBase?.map((questao) => ({
    ...questao,
    id: novoId()
  }))

  const { data, error } = await ctx.supabase
    .from('atividades')
    .insert({
      aluno_id: ctx.user.id,
      ambiente_id: ambienteId,
      titulo: (
        config.titulo?.trim() || ROTULO_TIPO_ATIVIDADE[config.tipo]
      ).slice(0, 200),
      tipo: config.tipo,
      material_ids: config.materialIds,
      dificuldade: config.dificuldade,
      topico: config.topico ?? null,
      questoes: base ?? [],
      origem_chat_id: config.origemChatId ?? null,
      origem_resumo_id: config.origemResumoId ?? null,
      status: base ? 'PRONTO' : 'GERANDO'
    })
    .select(COLUNAS_ATIVIDADE)
    .single()
  verificarInsercao(error, 'Ambiente')
  const atividade = data as AtividadeRow
  await tocarAmbiente(ctx, ambienteId)
  if (base) return mapearAtividade(atividade)

  executarEmSegundoPlano(
    `atividade ${atividade.id}`,
    async () => {
      const [trechos, tema] = await Promise.all([
        carregarTrechos(ctx, config.materialIds),
        temaDoAmbiente(ctx, ambienteId)
      ])
      const parametros = {
        contexto: await contextoParaGeracao(ctx, trechos, {
          tema,
          topico: config.topico
        }),
        tema,
        quantidade: config.quantidade,
        dificuldade: config.dificuldade,
        topico: config.topico
      }

      if (config.tipo === 'FLASHCARDS') {
        const flashcards = await gerarFlashcards(parametros)
        if (!flashcards.length)
          throw new ApiError(502, 'A IA não gerou nenhum cartão')
        await atualizarAtividade(ctx, atividade.id, {
          flashcards,
          status: 'PRONTO'
        })
        return
      }

      const questoes = await gerarQuestoes(
        TIPO_QUESTAO_DA_ATIVIDADE[config.tipo],
        parametros
      )
      if (!questoes.length)
        throw new ApiError(502, 'A IA não gerou nenhuma questão válida')
      await atualizarAtividade(ctx, atividade.id, {
        questoes,
        status: 'PRONTO'
      })
    },
    (mensagem) =>
      atualizarAtividade(ctx, atividade.id, {
        status: 'ERRO',
        mensagem_erro: mensagem
      })
  )

  return mapearAtividade(atividade)
}

export async function excluirAtividade({ supabase }: Contexto, id: string) {
  const { data, error } = await supabase
    .from('atividades')
    .delete()
    .eq('id', id)
    .select('id')
  verificar(error)
  exigir(data?.[0], 'Atividade')
}

export async function listarTentativas(
  { supabase }: Contexto,
  atividadeId: string
): Promise<TentativaAtividade[]> {
  const { data, error } = await supabase
    .from('tentativas_atividade')
    .select(COLUNAS_TENTATIVA_ATIVIDADE)
    .eq('atividade_id', atividadeId)
    .order('iniciada_em', { ascending: false })
  verificar(error)
  return ((data ?? []) as TentativaAtividadeRow[]).map(mapearTentativaAtividade)
}

/** Nova tentativa; a que estava em andamento é descartada. */
export async function iniciarTentativa(
  ctx: Contexto,
  atividadeId: string
): Promise<TentativaAtividade> {
  const atividade = await buscarAtividade(ctx, atividadeId)
  const { error: erroExclusao } = await ctx.supabase
    .from('tentativas_atividade')
    .delete()
    .eq('atividade_id', atividadeId)
    .is('concluida_em', null)
  verificar(erroExclusao)

  const { data, error } = await ctx.supabase
    .from('tentativas_atividade')
    .insert({
      aluno_id: ctx.user.id,
      atividade_id: atividadeId,
      total: atividade.questoes?.length ?? 0
    })
    .select(COLUNAS_TENTATIVA_ATIVIDADE)
    .single()
  verificar(error)
  return mapearTentativaAtividade(data as TentativaAtividadeRow)
}

/** O front envia o estado inteiro da tentativa a cada passo. */
export async function salvarTentativa(
  ctx: Contexto,
  atividadeId: string,
  tentativaId: string,
  tentativa: Omit<TentativaAtividade, 'id' | 'atividadeId' | 'iniciadaEm'>
): Promise<TentativaAtividade> {
  const { data, error } = await ctx.supabase
    .from('tentativas_atividade')
    .update({
      respostas: tentativa.respostas,
      correcoes_discursivas: tentativa.correcoesDiscursivas,
      confirmadas: tentativa.confirmadas,
      indice_atual: tentativa.indiceAtual,
      acertos: tentativa.acertos,
      total: tentativa.total,
      concluida_em: tentativa.concluidaEm
    })
    .eq('id', tentativaId)
    .eq('atividade_id', atividadeId)
    .select(COLUNAS_TENTATIVA_ATIVIDADE)
    .maybeSingle()
  verificar(error)
  const salva = exigir(data as TentativaAtividadeRow | null, 'Tentativa')

  const { data: atividade } = await ctx.supabase
    .from('atividades')
    .select('ambiente_id')
    .eq('id', atividadeId)
    .maybeSingle()
  if (atividade) await tocarAmbiente(ctx, atividade.ambiente_id as string)
  return mapearTentativaAtividade(salva)
}

/** Procura a questão nas atividades e nos simulados do aluno. */
async function buscarQuestao(
  { supabase }: Contexto,
  questaoId: string
): Promise<Questao> {
  for (const tabela of ['atividades', 'simulados']) {
    const { data, error } = await supabase
      .from(tabela)
      .select('questoes')
      // Em jsonb o filtro precisa ser JSON em texto; um array JS viraria
      // array do Postgres ({...}) e a consulta falharia.
      .contains('questoes', JSON.stringify([{ id: questaoId }]))
      .limit(1)
    verificar(error)
    const questao = ((data?.[0]?.questoes ?? []) as Questao[]).find(
      ({ id }) => id === questaoId
    )
    if (questao) return questao
  }
  throw new ApiError(404, 'Questão não encontrada')
}

export async function corrigirDiscursiva(
  ctx: Contexto,
  questaoId: string,
  texto: string
): Promise<CorrecaoDiscursiva> {
  const questao = await buscarQuestao(ctx, questaoId)
  if (questao.tipo !== 'DISCURSIVA') {
    throw new ApiError(
      422,
      'Apenas questões discursivas são corrigidas por rubrica'
    )
  }
  return corrigirComIa(questao, texto)
}

export async function explicarDeOutroJeito(ctx: Contexto, questaoId: string) {
  return explicarComIa(await buscarQuestao(ctx, questaoId))
}

export async function avaliarFlashcard(
  ctx: Contexto,
  atividadeId: string,
  flashcardId: string,
  avaliacao: AvaliacaoFlashcard
): Promise<Flashcard> {
  const atividade = await buscarAtividade(ctx, atividadeId)
  const cartao = exigir(
    (atividade.flashcards ?? []).find(({ id }) => id === flashcardId),
    'Flashcard'
  )
  const atualizado: Flashcard = {
    ...cartao,
    revisao: proximoEstadoRevisao(cartao.revisao, avaliacao)
  }
  await atualizarAtividade(ctx, atividadeId, {
    flashcards: atividade.flashcards.map((item) =>
      item.id === flashcardId ? atualizado : item
    )
  })
  await tocarAmbiente(ctx, atividade.ambiente_id)
  return atualizado
}
