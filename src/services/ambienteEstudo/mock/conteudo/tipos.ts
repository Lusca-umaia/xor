import { FormatoResumo, Questao, TipoMaterial } from '@/@types/AmbienteEstudo'

type OmitirDistributivo<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never

export interface TrechoPacote {
  /** Índice em `materiaisDemonstracao` de onde o trecho veio. */
  material: number
  pagina: number
  texto: string
}

/** Questão sem id/citações; `trecho` aponta para `trechos` do pacote. */
export type QuestaoPacote = OmitirDistributivo<
  Questao,
  'id' | 'citacoes' | 'origem'
> & { trecho: number }

export interface RespostaPacote {
  conteudo: string
  trechos: number[]
}

/**
 * Conteúdo de demonstração de uma área. Substitui a IA enquanto o back não
 * existe: os geradores montam questões, resumos e respostas a partir daqui.
 */
export interface PacoteConteudo {
  chave: string
  palavrasChave: RegExp
  materiaisDemonstracao: {
    nome: string
    tipo: TipoMaterial
    paginas: number | null
    tamanhoBytes: number
  }[]
  trechos: TrechoPacote[]
  questoes: QuestaoPacote[]
  flashcards: { frente: string; verso: string; trecho: number }[]
  resumos: Record<FormatoResumo, RespostaPacote>
  chat: {
    tutor: RespostaPacote[]
    explicacao: RespostaPacote[]
    dicas: string[]
  }
  explicacoesAlternativas: string[]
}

/** Mantém as barras invertidas do LaTeX (`\frac`, `\int`...). */
export const m = String.raw
