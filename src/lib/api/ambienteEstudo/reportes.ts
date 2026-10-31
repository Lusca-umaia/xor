import 'server-only'

import type { ReporteConteudoIA } from '@/@types/AmbienteEstudo'
import { Contexto, verificar } from './comum'

export async function reportarConteudo(
  { supabase, user }: Contexto,
  dados: Pick<ReporteConteudoIA, 'alvo' | 'motivo' | 'comentario'>
): Promise<ReporteConteudoIA> {
  const { data, error } = await supabase
    .from('reportes_ia')
    .insert({
      aluno_id: user.id,
      alvo_tipo: dados.alvo.tipo,
      alvo_id: dados.alvo.id,
      motivo: dados.motivo,
      comentario: dados.comentario?.trim() || null
    })
    .select('id, criado_em')
    .single()
  verificar(error)
  const salvo = data as { id: string; criado_em: string }
  return {
    id: salvo.id,
    alvo: dados.alvo,
    motivo: dados.motivo,
    comentario: dados.comentario?.trim() || null,
    criadoEm: salvo.criado_em
  }
}
