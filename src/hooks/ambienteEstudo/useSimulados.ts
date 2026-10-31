import { useQuery } from '@tanstack/react-query'
import {
  ConfigSimulado,
  ResultadoSimulado,
  Simulado,
  SimuladoListagem,
  TentativaSimulado
} from '@/@types/AmbienteEstudo'
import {
  entregarTentativa,
  excluirSimulado,
  gerarSimulado,
  iniciarTentativa,
  listarSimulados,
  obterSimulado,
  obterTentativa
} from '@/services/ambienteEstudo/simulados'
import {
  chavesAmbiente,
  consultarEnquanto,
  repetirConsulta
} from './chavesConsulta'
import { useMutacaoAmbiente } from './useMutacaoAmbiente'

export const correcaoPendente = (resultado: ResultadoSimulado | null) =>
  Boolean(
    resultado &&
      Object.values(resultado.correcoesDiscursivas).some(
        ({ status }) => status === 'GERANDO'
      )
  )

export function useSimulados(ambienteId: string) {
  return useQuery({
    queryKey: chavesAmbiente.simulados(ambienteId),
    queryFn: () => listarSimulados(ambienteId),
    retry: repetirConsulta,
    refetchIntervalInBackground: true,
    refetchInterval: consultarEnquanto((simulados: SimuladoListagem[]) =>
      simulados.some(
        ({ status, tentativas }) =>
          status === 'GERANDO' ||
          tentativas.some(({ resultado }) => correcaoPendente(resultado))
      )
    )
  })
}

export function useSimulado(id: string) {
  return useQuery({
    queryKey: chavesAmbiente.simulado(id),
    queryFn: () => obterSimulado(id),
    retry: repetirConsulta,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    refetchInterval: consultarEnquanto(
      (simulado: Simulado) => simulado.status === 'GERANDO'
    )
  })
}

/**
 * Durante a prova, o estado local da página é a fonte da verdade; por isso a
 * tentativa não é recarregada ao voltar para a aba.
 */
export function useTentativaSimulado(id: string) {
  return useQuery({
    queryKey: chavesAmbiente.tentativaSimulado(id),
    queryFn: () => obterTentativa(id),
    retry: repetirConsulta,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    refetchInterval: consultarEnquanto((tentativa: TentativaSimulado) =>
      correcaoPendente(tentativa.resultado)
    )
  })
}

export function useGerarSimulado(ambienteId: string) {
  return useMutacaoAmbiente(
    (dados: { titulo?: string; config: ConfigSimulado }) =>
      gerarSimulado(ambienteId, dados)
  )
}

export function useExcluirSimulado() {
  return useMutacaoAmbiente(excluirSimulado, {
    mensagemSucesso: 'Simulado excluído.'
  })
}

export function useIniciarTentativa() {
  return useMutacaoAmbiente(iniciarTentativa)
}

export function useEntregarTentativa() {
  return useMutacaoAmbiente(
    ({ id, automatica }: { id: string; automatica: boolean }) =>
      entregarTentativa(id, automatica)
  )
}
