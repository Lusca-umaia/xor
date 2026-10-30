'use client'

import { useMemo } from 'react'
import type { DadosAcademicos } from '@/@types/Academico'
import { adaptarProgresso } from '@/services/academico/adaptarProgresso'
import { DADOS_DEMO } from '@/services/academico/dadosDemo'
import { useProgresso } from './useProgresso'

// Histórico real do aluno; só cai nos dados de demonstração se ele ainda não tiver
// nenhuma tentativa registrada.
export function useAcademico() {
  const { data, isLoading, isError } = useProgresso()
  const dados = useMemo<DadosAcademicos | undefined>(() => {
    if (!data) return undefined
    if (!data.disciplinas.some((d) => d.tentativas.length > 0))
      return DADOS_DEMO
    return { ...adaptarProgresso(data), demonstracao: false }
  }, [data])
  return { data: dados, isLoading, isError }
}
