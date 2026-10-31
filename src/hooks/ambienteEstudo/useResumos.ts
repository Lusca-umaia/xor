import { useQuery } from '@tanstack/react-query'
import { ConfigResumo, Resumo } from '@/@types/AmbienteEstudo'
import {
  atualizarResumo,
  excluirResumo,
  gerarResumo,
  listarResumos,
  obterResumo
} from '@/services/ambienteEstudo/resumos'
import {
  chavesAmbiente,
  consultarEnquanto,
  repetirConsulta
} from './chavesConsulta'
import { useMutacaoAmbiente } from './useMutacaoAmbiente'

export function useResumos(ambienteId: string) {
  return useQuery({
    queryKey: chavesAmbiente.resumos(ambienteId),
    queryFn: () => listarResumos(ambienteId),
    retry: repetirConsulta,
    refetchIntervalInBackground: true,
    refetchInterval: consultarEnquanto((resumos: Resumo[]) =>
      resumos.some(({ status }) => status === 'GERANDO')
    )
  })
}

export function useResumo(id: string) {
  return useQuery({
    queryKey: chavesAmbiente.resumo(id),
    queryFn: () => obterResumo(id),
    retry: repetirConsulta,
    refetchIntervalInBackground: true,
    refetchInterval: consultarEnquanto(
      (resumo: Resumo) => resumo.status === 'GERANDO'
    )
  })
}

export function useGerarResumo(ambienteId: string) {
  return useMutacaoAmbiente(
    (config: ConfigResumo) => gerarResumo(ambienteId, config),
    {
      mensagemSucesso:
        'Gerando resumo... ele aparece na lista em alguns segundos.'
    }
  )
}

export function useAtualizarResumo() {
  return useMutacaoAmbiente(
    ({
      id,
      dados
    }: {
      id: string
      dados: Parameters<typeof atualizarResumo>[1]
    }) => atualizarResumo(id, dados),
    { mensagemSucesso: 'Resumo salvo.' }
  )
}

export function useExcluirResumo() {
  return useMutacaoAmbiente(excluirResumo, {
    mensagemSucesso: 'Resumo excluído.'
  })
}
