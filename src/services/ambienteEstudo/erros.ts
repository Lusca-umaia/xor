export class ErroNaoEncontrado extends Error {
  constructor(recurso: string) {
    super(`${recurso} não encontrado(a).`)
    this.name = 'ErroNaoEncontrado'
  }
}

export class ErroPrazoEsgotado extends Error {
  constructor() {
    super(
      'O tempo do simulado acabou. As respostas não podem mais ser alteradas.'
    )
    this.name = 'ErroPrazoEsgotado'
  }
}

export function exigir<T>(item: T | undefined, recurso: string): T {
  if (!item) throw new ErroNaoEncontrado(recurso)
  return item
}

export const mensagemDeErro = (erro: unknown) =>
  erro instanceof Error ? erro.message : 'Algo deu errado. Tente novamente.'
