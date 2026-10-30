'use client'

import { useQuery } from '@tanstack/react-query'
import { getQuestionario } from '@/services/questionarios/getQuestionario'
import { listarQuestionarios } from '@/services/questionarios/listarQuestionarios'
import { QUERY_KEYS } from '../queryKeys'

export function useQuestionarios() {
  return useQuery({
    queryKey: QUERY_KEYS.QUESTIONARIOS,
    queryFn: listarQuestionarios
  })
}

export function useQuestionario(questionarioId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.QUESTIONARIO(questionarioId ?? 0),
    queryFn: () => getQuestionario(questionarioId!),
    enabled: questionarioId !== null
  })
}
