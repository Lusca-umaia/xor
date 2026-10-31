import 'server-only'

import type { EventoXp, ProgressoXp, TipoXp } from '@/@types/AmbienteEstudo'
import { createAdminClient } from '@/lib/supabase/admin'
import { Contexto, verificar } from './comum'

// XP como registro de eventos (tabela xp_eventos). Cada ação concede XP uma
// única vez por referência e nunca é retirado. Só o servidor grava, com a
// chave secreta, depois de conferir a ação com o cliente do aluno.

// Máximo de eventos de cada tipo por ambiente e por dia: estudar de verdade
// rende XP, repetir a mesma ação em massa não.
const LIMITE_DIARIO: Record<TipoXp, number> = {
  MATERIAL: 10,
  MENSAGEM: 15,
  RESUMO: 3,
  ATIVIDADE: 6,
  FLASHCARD: 60,
  SIMULADO: 3,
  SIMULADO_NOTA: 3
}

// O dia vira à meia-noite de Fortaleza (UTC-3, sem horário de verão).
const FUSO_MS = 3 * 3_600_000
const inicioDoDia = (agora = Date.now()) => {
  const local = new Date(agora - FUSO_MS)
  local.setUTCHours(0, 0, 0, 0)
  return new Date(local.getTime() + FUSO_MS).toISOString()
}

/** Chave do dia em Fortaleza (ex.: 2026-10-30), para referências diárias. */
export const diaDeHoje = () => inicioDoDia().slice(0, 10)

/**
 * Concede XP ao aluno. Nunca lança: uma falha aqui não pode derrubar a ação
 * de estudo que acabou de dar certo.
 */
export async function concederXp(
  { user }: Contexto,
  evento: { ambienteId: string; tipo: TipoXp; referencia: string; xp: number }
) {
  const xp = Math.round(evento.xp)
  if (xp < 1) return
  try {
    const admin = createAdminClient()
    const { count, error } = await admin
      .from('xp_eventos')
      .select('id', { count: 'exact', head: true })
      .eq('aluno_id', user.id)
      .eq('ambiente_id', evento.ambienteId)
      .eq('tipo', evento.tipo)
      .gte('criado_em', inicioDoDia())
    if (error) throw error
    if ((count ?? 0) >= LIMITE_DIARIO[evento.tipo]) return

    const { error: erroInsercao } = await admin.from('xp_eventos').upsert(
      {
        aluno_id: user.id,
        ambiente_id: evento.ambienteId,
        tipo: evento.tipo,
        referencia: evento.referencia.slice(0, 120),
        xp: Math.min(xp, 200)
      },
      { onConflict: 'aluno_id,tipo,referencia', ignoreDuplicates: true }
    )
    if (erroInsercao) throw erroInsercao
  } catch (erro) {
    console.error('[xp] não foi possível conceder XP', evento, erro)
  }
}

const JANELA_DIAS = 60

/** XP total do ambiente e os eventos recentes (para a sequência de dias). */
export async function obterProgressoXp(
  { supabase }: Contexto,
  ambienteId: string
): Promise<ProgressoXp> {
  const desde = new Date(Date.now() - JANELA_DIAS * 86_400_000).toISOString()
  const [total, recentes] = await Promise.all([
    supabase.rpc('xp_do_ambiente', { p_ambiente_id: ambienteId }),
    supabase
      .from('xp_eventos')
      .select('tipo, xp, criado_em')
      .eq('ambiente_id', ambienteId)
      .gte('criado_em', desde)
      .order('criado_em', { ascending: false })
      .limit(1000)
  ])
  verificar(total.error)
  verificar(recentes.error)

  const porTipo = {} as Record<TipoXp, number>
  let xp = 0
  for (const linha of (total.data ?? []) as { tipo: TipoXp; xp: number }[]) {
    // bigint chega como número ou texto, conforme o tamanho.
    const valor = Number(linha.xp)
    porTipo[linha.tipo] = valor
    xp += valor
  }
  return {
    xp,
    porTipo,
    eventos: (
      (recentes.data ?? []) as { tipo: TipoXp; xp: number; criado_em: string }[]
    ).map(
      ({ tipo, xp: valor, criado_em }): EventoXp => ({
        tipo,
        xp: valor,
        criadoEm: criado_em
      })
    )
  }
}

/** Dias (YYYY-MM-DD) com XP em qualquer ambiente, nos últimos 90 dias. */
export async function listarDiasDeEstudo({
  supabase
}: Contexto): Promise<string[]> {
  const { data, error } = await supabase.rpc('dias_de_estudo')
  verificar(error)
  return ((data ?? []) as { dia: string }[]).map(({ dia }) => dia)
}
