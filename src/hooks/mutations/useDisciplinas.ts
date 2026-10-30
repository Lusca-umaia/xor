'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NovaDisciplinaInput, SituacaoInput } from '@/lib/api/schemas'
import { criarDisciplina } from '@/services/disciplinas/criarDisciplina'
import { definirSituacao } from '@/services/disciplinas/definirSituacao'
import { editarDisciplina } from '@/services/disciplinas/editarDisciplina'
import { excluirDisciplina } from '@/services/disciplinas/excluirDisciplina'
import { excluirTentativa } from '@/services/tentativas/excluirTentativa'
import { QUERY_KEYS } from '../queryKeys'

// Toda alteração em disciplinas recarrega o progresso, inclusive em erro
// parcial (ex.: dados salvos, mas situação recusada).
function useAtualizarProgresso() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESSO })
}

export function useCriarDisciplina() {
  const atualizarProgresso = useAtualizarProgresso()
  return useMutation({
    mutationFn: criarDisciplina,
    onSettled: atualizarProgresso
  })
}

export function useDefinirSituacao() {
  const atualizarProgresso = useAtualizarProgresso()
  return useMutation({
    mutationFn: definirSituacao,
    onSettled: atualizarProgresso
  })
}

export function useExcluirDisciplina() {
  const atualizarProgresso = useAtualizarProgresso()
  return useMutation({
    mutationFn: excluirDisciplina,
    onSettled: atualizarProgresso
  })
}

export function useExcluirTentativa() {
  const atualizarProgresso = useAtualizarProgresso()
  return useMutation({
    mutationFn: excluirTentativa,
    onSettled: atualizarProgresso
  })
}

export interface SalvarDisciplinaPayload {
  // Sem id, cria a disciplina.
  disciplinaId?: number
  // Enviados apenas quando mudaram.
  dados?: NovaDisciplinaInput
  situacao?: SituacaoInput
}

// Salvar do editor: cria, ou edita dados e/ou situação.
export function useSalvarDisciplina() {
  const atualizarProgresso = useAtualizarProgresso()

  return useMutation({
    mutationFn: async ({
      disciplinaId,
      dados,
      situacao
    }: SalvarDisciplinaPayload) => {
      if (disciplinaId === undefined) {
        if (!dados) throw new Error('Dados da disciplina ausentes')
        await criarDisciplina({ ...dados, situacao })
        return
      }
      if (dados) await editarDisciplina({ disciplinaId, dados })
      if (situacao) await definirSituacao({ disciplinaId, situacao })
    },
    onSettled: atualizarProgresso
  })
}
