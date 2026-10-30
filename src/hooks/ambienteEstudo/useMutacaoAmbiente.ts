import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensagemDeErro } from '@/services/ambienteEstudo/erros'
import { chavesAmbiente } from './chavesConsulta'

interface OpcoesMutacao<TResultado> {
  mensagemSucesso?: string | ((resultado: TResultado) => string)
  /** Desligue em operações frequentes (ex.: salvar respostas). */
  invalidar?: boolean
}

/**
 * Mutação padrão do ambiente: invalida os dados em cache ao terminar e mostra
 * toasts de sucesso e erro.
 */
export function useMutacaoAmbiente<TVariaveis, TResultado>(
  mutationFn: (variaveis: TVariaveis) => Promise<TResultado>,
  { mensagemSucesso, invalidar = true }: OpcoesMutacao<TResultado> = {}
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (resultado) => {
      if (invalidar) {
        queryClient.invalidateQueries({ queryKey: chavesAmbiente.raiz })
      }
      if (mensagemSucesso) {
        toast.success(
          typeof mensagemSucesso === 'function'
            ? mensagemSucesso(resultado)
            : mensagemSucesso
        )
      }
    },
    onError: (erro) => toast.error(mensagemDeErro(erro))
  })
}
