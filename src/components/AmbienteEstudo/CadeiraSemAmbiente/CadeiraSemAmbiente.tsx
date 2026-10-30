import { LuPlus } from 'react-icons/lu'
import { CadeiraHistorico } from '@/@types/AmbienteEstudo'
import { formatarNota } from '@/utils/ambienteEstudo/formatar'
import Botao from '../Botao/Botao'
import SeloSituacao from '../SeloSituacao/SeloSituacao'

interface CadeiraSemAmbienteProps {
  cadeira: CadeiraHistorico
  aoCriar: () => void
  criando?: boolean
}

/**
 * Cadeira do histórico que ainda não tem ambiente. Não existe no banco: o
 * ambiente só é criado quando o aluno pede.
 */
export function CardCadeiraSemAmbiente({
  cadeira,
  aoCriar,
  criando
}: CadeiraSemAmbienteProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-gray-300 bg-white/60 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-xs font-semibold text-gray-500">
          {cadeira.codigo}
        </span>
        <SeloSituacao situacao={cadeira.situacao} />
      </div>
      <div className="space-y-1">
        <p className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-gray-900">
          {cadeira.nome}
        </p>
        <p className="text-sm text-gray-500">
          Ainda sem ambiente. Envie materiais para estudar com a IA.
        </p>
      </div>
      <Botao
        className="mt-auto w-full"
        icone={<LuPlus aria-hidden />}
        onClick={aoCriar}
        carregando={criando}
      >
        Criar ambiente
      </Botao>
    </div>
  )
}

/** Versão compacta, em lista, para as cadeiras de períodos passados. */
export function LinhaCadeiraSemAmbiente({
  cadeira,
  aoCriar,
  criando
}: CadeiraSemAmbienteProps) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      <span className="w-20 shrink-0 font-mono text-xs font-semibold text-gray-500">
        {cadeira.codigo}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
        {cadeira.nome}
      </span>
      {cadeira.nota !== null && (
        <span className="text-xs font-medium text-gray-500">
          Nota {formatarNota(cadeira.nota)}
        </span>
      )}
      <SeloSituacao situacao={cadeira.situacao} />
      <Botao
        tamanho="sm"
        icone={<LuPlus aria-hidden />}
        onClick={aoCriar}
        carregando={criando}
      >
        Criar ambiente
      </Botao>
    </li>
  )
}
