import { normalizarTexto } from '@/utils/historicoAcademico'
import { pacoteCalculo } from './calculo'
import { pacoteComputacao } from './computacao'
import { pacoteGenerico } from './generico'
import { pacoteRedacao } from './redacao'
import { PacoteConteudo } from './tipos'

const PACOTES = [pacoteCalculo, pacoteComputacao, pacoteRedacao]

/** Escolhe o pacote de demonstração pelo nome do ambiente. */
export function escolherPacote(nomeAmbiente: string): PacoteConteudo {
  const nome = normalizarTexto(nomeAmbiente)
  return (
    PACOTES.find(({ palavrasChave }) => palavrasChave.test(nome)) ??
    pacoteGenerico
  )
}

export type { PacoteConteudo } from './tipos'
