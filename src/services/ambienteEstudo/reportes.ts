import {
  AlvoReporte,
  MotivoReporte,
  ReporteConteudoIA
} from '@/@types/AmbienteEstudo'
import { registrarEventoEstudo } from './eventos'
import { agora, alterarBanco, clonar, gerarId } from './mock/armazenamento'
import { preparar } from './mock/preparar'

export async function reportarConteudo(dados: {
  alvo: { tipo: AlvoReporte; id: string }
  motivo: MotivoReporte
  comentario: string | null
}): Promise<ReporteConteudoIA> {
  await preparar()
  const reporte: ReporteConteudoIA = {
    id: gerarId(),
    ...dados,
    comentario: dados.comentario?.trim() || null,
    criadoEm: agora()
  }
  alterarBanco((banco) => banco.reportes.push(reporte))
  registrarEventoEstudo('REPORTE_ENVIADO', { alvo: dados.alvo.tipo })
  return clonar(reporte)
}
