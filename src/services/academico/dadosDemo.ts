import type { DadosAcademicos } from '@/@types/Academico'
import { CURRICULO_CC } from '../mocks/curriculoCC'
import { HISTORICO_DEMO } from '../mocks/historico'

// Usado só quando o aluno ainda não tem nenhuma tentativa registrada no app.
export const DADOS_DEMO: DadosAcademicos = {
  curriculo: CURRICULO_CC,
  historico: HISTORICO_DEMO,
  semPeriodo: 0,
  demonstracao: true
}
