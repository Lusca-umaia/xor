export type TipoEventoEstudo =
  | 'QUESTAO_RESPONDIDA'
  | 'ATIVIDADE_CONCLUIDA'
  | 'FLASHCARD_REVISADO'
  | 'SIMULADO_ENTREGUE'
  | 'REPORTE_ENVIADO'

/**
 * Ponto de integração com a gamificação (XP, streak, conquistas). Nesta fase
 * não faz nada além de registrar no console em desenvolvimento.
 */
export function registrarEventoEstudo(
  tipo: TipoEventoEstudo,
  dados: Record<string, unknown> = {}
) {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[ambienteEstudo] evento', tipo, dados)
  }
}
