import { useQuery } from '@tanstack/react-query'
import { DadosAmbiente } from '@/@types/AmbienteEstudo'
import {
  atualizarAmbiente,
  criarAmbiente,
  excluirAmbiente,
  listarAmbientes,
  listarResumoCadeiras,
  obterAmbiente
} from '@/services/ambienteEstudo/ambientes'
import { chavesAmbiente, repetirConsulta } from './chavesConsulta'
import { useMutacaoAmbiente } from './useMutacaoAmbiente'

export function useAmbientes() {
  return useQuery({
    queryKey: chavesAmbiente.ambientes(),
    queryFn: listarAmbientes,
    retry: repetirConsulta
  })
}

/** Resumo dos ambientes de cadeira, para a tela inicial. */
export function useResumoCadeiras() {
  return useQuery({
    queryKey: chavesAmbiente.resumoCadeiras(),
    queryFn: listarResumoCadeiras,
    retry: repetirConsulta
  })
}

export function useAmbiente(id: string) {
  return useQuery({
    queryKey: chavesAmbiente.ambiente(id),
    queryFn: () => obterAmbiente(id),
    retry: repetirConsulta
  })
}

export function useCriarAmbiente() {
  return useMutacaoAmbiente(criarAmbiente, {
    mensagemSucesso: (ambiente) => `Ambiente “${ambiente.nome}” criado.`
  })
}

export function useAtualizarAmbiente() {
  return useMutacaoAmbiente(
    ({
      id,
      dados
    }: {
      id: string
      dados: Parameters<typeof atualizarAmbiente>[1]
    }) => atualizarAmbiente(id, dados)
  )
}

export function useExcluirAmbiente() {
  return useMutacaoAmbiente(excluirAmbiente, {
    mensagemSucesso: 'Ambiente excluído.'
  })
}

export type { DadosAmbiente }
