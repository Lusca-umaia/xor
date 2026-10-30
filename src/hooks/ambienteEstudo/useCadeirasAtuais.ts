import { useMemo } from 'react'
import { CadeiraAtual } from '@/@types/AmbienteEstudo'
import { useProgresso } from '@/hooks/queries/useProgresso'
import { cadeirasEmAndamento } from '@/services/ambienteEstudo/cadeiras'

/** Cadeiras em andamento do aluno, derivadas do progresso já em cache. */
export function useCadeirasAtuais(): CadeiraAtual[] {
  const { data: progresso } = useProgresso()
  return useMemo(
    () => (progresso ? cadeirasEmAndamento(progresso) : []),
    [progresso]
  )
}
