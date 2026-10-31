import {
  AlvoReporte,
  MotivoReporte,
  ReporteConteudoIA
} from '@/@types/AmbienteEstudo'
import api from '../api'
import { dados } from './erros'
import { registrarEventoEstudo } from './eventos'

export async function reportarConteudo(reporte: {
  alvo: { tipo: AlvoReporte; id: string }
  motivo: MotivoReporte
  comentario: string | null
}) {
  const salvo = await dados(
    api.post<ReporteConteudoIA>('/reportes-ia', reporte)
  )
  registrarEventoEstudo('REPORTE_ENVIADO', { alvo: reporte.alvo.tipo })
  return salvo
}
