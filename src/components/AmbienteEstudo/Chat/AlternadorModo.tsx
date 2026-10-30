'use client'

import clsx from 'clsx'
import { LuBookOpen, LuGraduationCap } from 'react-icons/lu'
import { ModoChat } from '@/@types/AmbienteEstudo'

export const MODOS: {
  valor: ModoChat
  rotulo: string
  descricao: string
  icone: typeof LuGraduationCap
}[] = [
  {
    valor: 'TUTOR',
    rotulo: 'Tutor',
    descricao:
      'Guia o raciocínio com perguntas e dicas antes de dar a resposta.',
    icone: LuGraduationCap
  },
  {
    valor: 'EXPLICACAO',
    rotulo: 'Explicação',
    descricao: 'Responde de forma direta e didática.',
    icone: LuBookOpen
  }
]

export default function AlternadorModo({
  modo,
  aoMudar,
  desabilitado
}: {
  modo: ModoChat
  aoMudar: (modo: ModoChat) => void
  desabilitado?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Modo do assistente"
      className="inline-flex rounded-lg bg-gray-100 p-0.5"
    >
      {MODOS.map(({ valor, rotulo, descricao, icone: Icone }) => (
        <button
          key={valor}
          type="button"
          role="radio"
          aria-checked={modo === valor}
          title={descricao}
          disabled={desabilitado}
          onClick={() => aoMudar(valor)}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed',
            modo === valor
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          )}
        >
          <Icone aria-hidden />
          <span className="max-sm:sr-only">{rotulo}</span>
        </button>
      ))}
    </div>
  )
}
