'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QuestionarioInput } from '@/lib/api/schemas'
import { criarQuestionario } from '@/services/questionarios/criarQuestionario'
import { editarQuestionario } from '@/services/questionarios/editarQuestionario'
import { enviarResolucao } from '@/services/questionarios/enviarResolucao'
import { excluirQuestionario } from '@/services/questionarios/excluirQuestionario'
import { gerarQuestoes } from '@/services/questionarios/gerarQuestoes'
import { QUERY_KEYS } from '../queryKeys'

export interface SalvarQuestionarioPayload {
  // Sem id, cria o questionário.
  questionarioId?: number
  dados: QuestionarioInput
}

// A lista e os detalhes compartilham a chave raiz ['questionarios'].
function useAtualizarQuestionarios() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUESTIONARIOS })
}

export function useSalvarQuestionario() {
  const atualizar = useAtualizarQuestionarios()

  return useMutation({
    mutationFn: ({ questionarioId, dados }: SalvarQuestionarioPayload) =>
      questionarioId === undefined
        ? criarQuestionario(dados)
        : editarQuestionario({ questionarioId, dados }),
    onSuccess: atualizar
  })
}

export function useExcluirQuestionario() {
  const atualizar = useAtualizarQuestionarios()
  return useMutation({ mutationFn: excluirQuestionario, onSuccess: atualizar })
}

export function useEnviarResolucao() {
  const atualizar = useAtualizarQuestionarios()
  return useMutation({ mutationFn: enviarResolucao, onSuccess: atualizar })
}

export function useGerarQuestoes() {
  return useMutation({ mutationFn: gerarQuestoes })
}
