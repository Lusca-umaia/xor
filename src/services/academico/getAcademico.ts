import { ALUNO_DEMO, HISTORICO_DEMO } from '../mocks/historico'
import { CURRICULO_CC } from '../mocks/curriculoCC'

// Mock: mesma assinatura que o futuro endpoint. Trocar o corpo por api.get quando houver banco.
export async function getAcademico() {
  return {
    aluno: ALUNO_DEMO,
    curriculo: CURRICULO_CC,
    historico: HISTORICO_DEMO,
    demonstracao: true
  }
}
