'use client'

import { useMemo } from 'react'
import type { DisciplinaCurriculo } from '@/@types/Academico'
import { useProgresso } from './queries/useProgresso'

// Disciplinas do semestre atual do aluno logado (status ANDAMENTO), dados reais.
export function useDisciplinasAtivas() {
  const { data, isLoading, isError } = useProgresso()
  const ativas = useMemo<DisciplinaCurriculo[]>(
    () =>
      (data?.disciplinas ?? [])
        .filter((d) => d.status === 'ANDAMENTO')
        .map((d) => ({
          codigo: d.codigo,
          nome: d.nome,
          cargaHoraria: d.cargaHoraria,
          semestre: d.semestre ?? 0,
          prerequisitos: []
        })),
    [data]
  )
  return { ativas, isLoading, isError }
}
