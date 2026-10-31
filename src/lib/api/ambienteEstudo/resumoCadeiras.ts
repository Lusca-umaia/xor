import 'server-only'

import type {
  Flashcard,
  ItemRetomar,
  ResultadoSimulado,
  ResumoCadeira
} from '@/@types/AmbienteEstudo'
import { contarPendentes } from '@/utils/ambienteEstudo/revisaoEspacada'
import { Contexto, verificar } from './comum'

// Resumo dos ambientes de cadeira para a tela inicial. Busca tudo de uma vez
// (um punhado de consultas, qualquer que seja o número de cadeiras) em vez
// das seis consultas por ambiente da visão geral.

// Abaixo disso o acerto por tópico ainda não diz muita coisa.
const MINIMO_QUESTOES_TOPICO = 3
const TAXA_TOPICO_FRACO = 0.7
const ITENS_RETOMAR = 3

type Linha<T> = T & { ambiente_id: string }

export async function listarResumoCadeiras(
  ctx: Contexto
): Promise<ResumoCadeira[]> {
  const { supabase } = ctx
  const { data: ambientes, error } = await supabase
    .from('ambientes')
    .select('id, disciplina_codigo')
    .not('disciplina_codigo', 'is', null)
    .eq('arquivado', false)
  verificar(error)
  const lista = (ambientes ?? []) as { id: string; disciplina_codigo: string }[]
  if (lista.length === 0) return []
  const ids = lista.map(({ id }) => id)

  const [xp, atividades, simulados, chats, resumos] = await Promise.all([
    supabase.rpc('xp_por_ambiente'),
    supabase
      .from('atividades')
      .select('id, ambiente_id, titulo, flashcards, criado_em')
      .in('ambiente_id', ids)
      .eq('status', 'PRONTO'),
    supabase
      .from('simulados')
      .select('id, ambiente_id, titulo')
      .in('ambiente_id', ids)
      .eq('status', 'PRONTO'),
    supabase
      .from('chats')
      .select('id, ambiente_id, titulo, atualizado_em')
      .in('ambiente_id', ids)
      .order('atualizado_em', { ascending: false })
      .limit(lista.length * ITENS_RETOMAR),
    supabase
      .from('resumos')
      .select('id, ambiente_id, titulo, atualizado_em')
      .in('ambiente_id', ids)
      .eq('status', 'PRONTO')
      .order('atualizado_em', { ascending: false })
      .limit(lista.length * ITENS_RETOMAR)
  ])
  for (const { error: erro } of [xp, atividades, simulados, chats, resumos])
    verificar(erro)

  const linhasAtividade = (atividades.data ?? []) as Linha<{
    id: string
    titulo: string
    flashcards: Flashcard[] | null
    criado_em: string
  }>[]
  const linhasSimulado = (simulados.data ?? []) as Linha<{
    id: string
    titulo: string
  }>[]

  const [abertasAtividade, tentativasSimulado] = await Promise.all([
    linhasAtividade.length
      ? supabase
          .from('tentativas_atividade')
          .select('atividade_id, iniciada_em')
          .in(
            'atividade_id',
            linhasAtividade.map(({ id }) => id)
          )
          .is('concluida_em', null)
      : { data: [], error: null },
    linhasSimulado.length
      ? supabase
          .from('tentativas_simulado')
          .select(
            'id, simulado_id, iniciada_em, entregue_em, porTopico:resultado->porTopico'
          )
          .in(
            'simulado_id',
            linhasSimulado.map(({ id }) => id)
          )
      : { data: [], error: null }
  ])
  verificar(abertasAtividade.error)
  verificar(tentativasSimulado.error)

  const xpPorAmbiente = new Map(
    (
      (xp.data ?? []) as {
        ambiente_id: string
        xp: number | string
        ultimo_em: string
      }[]
    ).map((linha) => [linha.ambiente_id, linha])
  )
  const abertas = new Map(
    (
      (abertasAtividade.data ?? []) as {
        atividade_id: string
        iniciada_em: string
      }[]
    ).map(({ atividade_id, iniciada_em }) => [atividade_id, iniciada_em])
  )
  const tentativas = (tentativasSimulado.data ?? []) as {
    id: string
    simulado_id: string
    iniciada_em: string
    entregue_em: string | null
    porTopico: ResultadoSimulado['porTopico'] | null
  }[]

  return lista.map(({ id, disciplina_codigo }) => {
    const doAmbiente = <T extends { ambiente_id: string }>(linhas: T[]) =>
      linhas.filter(({ ambiente_id }) => ambiente_id === id)
    const minhasAtividades = doAmbiente(linhasAtividade)
    const meusSimulados = doAmbiente(linhasSimulado)
    const minhasTentativas = tentativas.filter(({ simulado_id }) =>
      meusSimulados.some((s) => s.id === simulado_id)
    )

    const dominio = new Map<string, { acertos: number; total: number }>()
    for (const { entregue_em, porTopico } of minhasTentativas) {
      if (!entregue_em) continue
      for (const { topico, acertos, total } of porTopico ?? []) {
        const atual = dominio.get(topico) ?? { acertos: 0, total: 0 }
        dominio.set(topico, {
          acertos: atual.acertos + acertos,
          total: atual.total + total
        })
      }
    }
    const [maisFraco] = [...dominio.entries()]
      .filter(([, { total }]) => total >= MINIMO_QUESTOES_TOPICO)
      .map(([topico, { acertos, total }]) => ({
        topico,
        taxa: acertos / total
      }))
      .sort((a, b) => a.taxa - b.taxa)

    const tituloSimulado = (simuladoId: string) =>
      meusSimulados.find((s) => s.id === simuladoId)?.titulo ?? 'Simulado'
    const retomar: ItemRetomar[] = [
      ...minhasTentativas
        .filter(({ entregue_em }) => !entregue_em)
        .map((t) => ({
          tipo: 'SIMULADO' as const,
          id: t.id,
          simuladoId: t.simulado_id,
          titulo: tituloSimulado(t.simulado_id),
          emAndamento: true,
          quando: t.iniciada_em
        })),
      ...minhasAtividades
        .filter((a) => abertas.has(a.id))
        .map((a) => ({
          tipo: 'ATIVIDADE' as const,
          id: a.id,
          titulo: a.titulo,
          emAndamento: true,
          quando: abertas.get(a.id) as string
        })),
      ...doAmbiente(
        (chats.data ?? []) as Linha<{
          id: string
          titulo: string
          atualizado_em: string
        }>[]
      ).map((c) => ({
        tipo: 'CHAT' as const,
        id: c.id,
        titulo: c.titulo,
        emAndamento: false,
        quando: c.atualizado_em
      })),
      ...doAmbiente(
        (resumos.data ?? []) as Linha<{
          id: string
          titulo: string
          atualizado_em: string
        }>[]
      ).map((r) => ({
        tipo: 'RESUMO' as const,
        id: r.id,
        titulo: r.titulo,
        emAndamento: false,
        quando: r.atualizado_em
      }))
    ]
      .sort(
        (a, b) =>
          Number(b.emAndamento) - Number(a.emAndamento) ||
          b.quando.localeCompare(a.quando)
      )
      .slice(0, ITENS_RETOMAR)

    const progresso = xpPorAmbiente.get(id)
    return {
      ambienteId: id,
      disciplinaCodigo: disciplina_codigo,
      // bigint chega como número ou texto, conforme o tamanho.
      xp: Number(progresso?.xp ?? 0),
      ultimoEstudoEm: progresso?.ultimo_em ?? null,
      flashcardsPendentes: minhasAtividades.reduce(
        (soma, { flashcards }) => soma + contarPendentes(flashcards ?? []),
        0
      ),
      topicoFraco:
        maisFraco && maisFraco.taxa < TAXA_TOPICO_FRACO ? maisFraco : null,
      retomar
    }
  })
}
