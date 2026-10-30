import { CadeiraAtual } from '@/@types/AmbienteEstudo'
import { Progresso } from '@/@types/Progresso'

/** Cadeiras em andamento a partir do progresso do aluno (GET /api/progresso). */
export function cadeirasEmAndamento(progresso: Progresso): CadeiraAtual[] {
  return progresso.disciplinas
    .filter(({ status }) => status === 'ANDAMENTO')
    .map(({ codigo, nome }) => ({ codigo, nome }))
}
