import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Atividade,
  AtividadeListagem,
  AvaliacaoFlashcard,
  ConfigAtividade
} from '@/@types/AmbienteEstudo'
import {
  avaliarFlashcard,
  corrigirDiscursiva,
  excluirAtividade,
  explicarDeOutroJeito,
  gerarAtividade,
  listarAtividades,
  listarTentativasAtividade,
  obterAtividade
} from '@/services/ambienteEstudo/atividades'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'
import {
  chavesAmbiente,
  consultarEnquanto,
  repetirConsulta
} from './chavesConsulta'
import { useMutacaoAmbiente } from './useMutacaoAmbiente'

export function useAtividades(ambienteId: string) {
  return useQuery({
    queryKey: chavesAmbiente.atividades(ambienteId),
    queryFn: () => listarAtividades(ambienteId),
    retry: repetirConsulta,
    refetchIntervalInBackground: true,
    refetchInterval: consultarEnquanto((atividades: AtividadeListagem[]) =>
      atividades.some(({ status }) => status === 'GERANDO')
    )
  })
}

export function useAtividade(id: string) {
  return useQuery({
    queryKey: chavesAmbiente.atividade(id),
    queryFn: () => obterAtividade(id),
    retry: repetirConsulta,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    refetchInterval: consultarEnquanto(
      (atividade: Atividade) => atividade.status === 'GERANDO'
    )
  })
}

export function useTentativasAtividade(atividadeId: string) {
  return useQuery({
    queryKey: chavesAmbiente.tentativasAtividade(atividadeId),
    queryFn: () => listarTentativasAtividade(atividadeId),
    retry: repetirConsulta,
    refetchOnWindowFocus: false
  })
}

export function useGerarAtividade(ambienteId: string) {
  return useMutacaoAmbiente(
    (config: ConfigAtividade) => gerarAtividade(ambienteId, config),
    {
      mensagemSucesso: (atividade) => `Atividade “${atividade.titulo}” criada.`
    }
  )
}

export function useExcluirAtividade() {
  return useMutacaoAmbiente(excluirAtividade, {
    mensagemSucesso: 'Atividade excluída.'
  })
}

export function useCorrigirDiscursiva() {
  return useMutation({
    mutationFn: ({ questaoId, texto }: { questaoId: string; texto: string }) =>
      corrigirDiscursiva(questaoId, texto),
    onError: (erro) => toast.error(mensagemDeErro(erro))
  })
}

export function useExplicarDeOutroJeito() {
  return useMutation({
    mutationFn: explicarDeOutroJeito,
    onError: (erro) => toast.error(mensagemDeErro(erro))
  })
}

export function useAvaliarFlashcard(atividadeId: string) {
  return useMutacaoAmbiente(
    ({
      flashcardId,
      avaliacao
    }: {
      flashcardId: string
      avaliacao: AvaliacaoFlashcard
    }) => avaliarFlashcard(atividadeId, flashcardId, avaliacao),
    { invalidar: false }
  )
}
