import clsx from 'clsx'
import { LuCheck, LuX } from 'react-icons/lu'
import { numeroParaLetra } from '@/utils/auxiliars'

// neutro/selecionada: respondendo. Os demais: correção.
export type EstadoAlternativa =
  | 'neutro'
  | 'selecionada'
  | 'correta'
  | 'errada'
  | 'gabarito'
  | 'apagada'

const ESTILOS: Record<EstadoAlternativa, { caixa: string; letra: string }> = {
  neutro: {
    caixa: 'ring-gray-200 hover:ring-gray-400 hover:bg-gray-50',
    letra: 'bg-gray-100 text-gray-600'
  },
  selecionada: {
    caixa: 'ring-2 ring-black bg-gray-50',
    letra: 'bg-black text-white'
  },
  // Marcada pelo aluno e certa.
  correta: {
    caixa: 'ring-2 ring-emerald-500 bg-emerald-50',
    letra: 'bg-emerald-500 text-white'
  },
  // Marcada pelo aluno e errada.
  errada: {
    caixa: 'ring-2 ring-red-500 bg-red-50',
    letra: 'bg-red-500 text-white'
  },
  // A certa, que o aluno não marcou.
  gabarito: {
    caixa: 'ring-2 ring-emerald-400 bg-white',
    letra: 'bg-emerald-100 text-emerald-700'
  },
  apagada: {
    caixa: 'ring-gray-100 opacity-70',
    letra: 'bg-gray-100 text-gray-400'
  }
}

interface AlternativaOpcaoProps {
  indice: number
  texto: string
  estado: EstadoAlternativa
  onClick?: () => void
}

const AlternativaOpcao: React.FC<AlternativaOpcaoProps> = ({
  indice,
  texto,
  estado,
  onClick
}) => {
  const { caixa, letra } = ESTILOS[estado]
  const icone =
    estado === 'correta' || estado === 'gabarito' ? (
      <LuCheck />
    ) : estado === 'errada' ? (
      <LuX />
    ) : (
      numeroParaLetra(indice + 1)
    )

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={estado === 'selecionada'}
      className={clsx(
        'flex w-full items-start gap-3 rounded-xl p-3 text-left ring-1 ring-inset transition',
        onClick ? 'cursor-pointer' : 'cursor-default',
        caixa
      )}
    >
      <span
        className={clsx(
          'flex size-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition',
          letra
        )}
      >
        {icone}
      </span>
      <span className="flex-1 whitespace-pre-wrap pt-0.5 text-sm font-medium text-gray-900">
        {texto}
      </span>
      {estado === 'gabarito' && (
        <span className="shrink-0 pt-0.5 text-xs font-semibold text-emerald-700">
          Resposta certa
        </span>
      )}
    </button>
  )
}

// Estado de uma alternativa na correção.
export function estadoNaCorrecao(
  indice: number,
  correta: number,
  resposta: number | null
): EstadoAlternativa {
  if (indice === correta) return resposta === correta ? 'correta' : 'gabarito'
  if (indice === resposta) return 'errada'
  return 'apagada'
}

export default AlternativaOpcao
