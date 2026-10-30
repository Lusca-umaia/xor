import { useMemo } from 'react'
import { CadeiraHistorico } from '@/@types/AmbienteEstudo'
import { useProgresso } from '@/hooks/queries/useProgresso'
import { cadeirasDoHistorico } from '@/services/ambienteEstudo/cadeiras'

/** Cadeiras do histórico acadêmico, derivadas do progresso já em cache. */
export function useHistoricoCadeiras() {
  const { data: progresso, isLoading } = useProgresso()
  return useMemo(() => {
    const cadeiras: CadeiraHistorico[] = progresso
      ? cadeirasDoHistorico(progresso)
      : []
    return {
      cadeiras,
      porCodigo: new Map(cadeiras.map((c) => [c.codigo, c])),
      carregando: isLoading
    }
  }, [progresso, isLoading])
}
