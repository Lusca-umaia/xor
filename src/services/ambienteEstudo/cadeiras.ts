import { CadeiraAtual } from '@/@types/AmbienteEstudo'
import { Progresso } from '@/@types/Progresso'
import { getProgresso } from '@/services/progresso/getProgresso'

/** Cadeiras em andamento a partir do progresso do aluno (GET /api/progresso). */
export function cadeirasEmAndamento(progresso: Progresso): CadeiraAtual[] {
  return progresso.disciplinas
    .filter(({ status }) => status === 'ANDAMENTO')
    .map(({ codigo, nome }) => ({ codigo, nome }))
}

export interface AlunoAtual {
  id: string
  cadeiras: CadeiraAtual[]
}

const VALIDADE_MS = 30_000
let cache: { valor: Promise<AlunoAtual | null>; em: number } | null = null

/**
 * Aluno logado e suas cadeiras em andamento, com cache curto para não repetir
 * a requisição a cada operação do mock. Devolve null se o progresso não puder
 * ser carregado (ex.: sessão expirada).
 */
export function obterAlunoAtual(): Promise<AlunoAtual | null> {
  if (!cache || Date.now() - cache.em > VALIDADE_MS) {
    cache = {
      em: Date.now(),
      valor: getProgresso()
        .then((progresso) => ({
          id: progresso.aluno.id,
          cadeiras: cadeirasEmAndamento(progresso)
        }))
        .catch(() => {
          cache = null
          return null
        })
    }
  }
  return cache.valor
}

/** Chamado no logout: a próxima conta não pode herdar o aluno em cache. */
export function esquecerAlunoAtual() {
  cache = null
}
