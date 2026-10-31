import { AxiosResponse } from 'axios'
import { getErrorMessage, getErrorStatus } from '../api'

export class ErroNaoEncontrado extends Error {
  constructor(mensagem = 'Não encontrado.') {
    super(mensagem)
    this.name = 'ErroNaoEncontrado'
  }
}

export class ErroPrazoEsgotado extends Error {
  constructor(
    mensagem = 'O tempo do simulado acabou. As respostas não podem mais ser alteradas.'
  ) {
    super(mensagem)
    this.name = 'ErroPrazoEsgotado'
  }
}

export const mensagemDeErro = (erro: unknown) =>
  erro instanceof Error ? erro.message : 'Algo deu errado. Tente novamente.'

/**
 * Converte o erro da API nos erros que as telas tratam: 404 vira
 * ErroNaoEncontrado e 409 (prazo do simulado) vira ErroPrazoEsgotado. O 401
 * segue como erro do axios para o QueryCache redirecionar ao login.
 */
function traduzirErro(erro: unknown): never {
  const status = getErrorStatus(erro)
  if (status === 401) throw erro
  const mensagem = getErrorMessage(erro, 'Algo deu errado. Tente novamente.')
  if (status === 404) throw new ErroNaoEncontrado(mensagem)
  if (status === 409) throw new ErroPrazoEsgotado(mensagem)
  throw new Error(mensagem)
}

/** Aguarda a requisição e devolve só os dados, com os erros traduzidos. */
export async function dados<T>(
  requisicao: Promise<AxiosResponse<T>>
): Promise<T> {
  try {
    return (await requisicao).data
  } catch (erro) {
    traduzirErro(erro)
  }
}
