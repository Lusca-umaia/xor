import { ReactNode } from 'react'

import clsx from 'clsx'
import { VscVerified } from 'react-icons/vsc'
import { LuCircle } from 'react-icons/lu'

export const STATUS_KEYS = {
  PENDENTE: 'PENDENTE',
  CONCLUIDA: 'CONCLUIDA'
} as const

interface CourseCardProps {
  nome: string
  codigo: string
  cargaHoraria: number
  carater: 'OBRIGATÓRIA' | 'OPTATIVA'
  status: keyof typeof STATUS_KEYS
  nota?: number | null
  onClick: () => void
  handleChangeNota: (value: string) => void
}

const CARD_ICON: Record<CourseCardProps['status'], ReactNode> = {
  [STATUS_KEYS.CONCLUIDA]: (
    <VscVerified className={`shrink-0 text-2xl text-green-600`} />
  ),
  [STATUS_KEYS.PENDENTE]: <LuCircle className="shrink-0 text-xl text-black" />
}

const CARD_BADGE: Record<CourseCardProps['status'], ReactNode> = {
  [STATUS_KEYS.CONCLUIDA]: (
    <span className="self-start shrink-0 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
      Concluída
    </span>
  ),
  [STATUS_KEYS.PENDENTE]: (
    <span className="self-start shrink-0 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
      Pendente
    </span>
  )
}

const DisciplinaBox: React.FC<CourseCardProps> = ({
  codigo,
  nome,
  nota,
  status,
  cargaHoraria,
  onClick,
  handleChangeNota
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'border-l-[6px] cursor-pointer hover:scale-105 duration-200 flex flex-col bg-white rounded-2xl rounded-l-lg space-y-3 shadow-md p-4',
        {
          'border-green-600': status === STATUS_KEYS.CONCLUIDA,
          'border-black': status === STATUS_KEYS.PENDENTE
        }
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-sm flex items-center gap-2">
          {CARD_ICON[status]}
          <div className="space-y-1">
            <h3
              title={nome}
              className="line-clamp-2 font-semibold leading-none tracking-tight"
            >
              {nome}
            </h3>
            <p className="text-sm leading-none font-medium text-gray-600">
              {codigo}
            </p>
          </div>
        </span>
        {CARD_BADGE[status]}
      </div>
      <div className="space-y-3 mt-auto">
        <p className="text-sm text-gray-600 leading-none flex justify-between font-semibold">
          Carga horária: <span className="font-medium">{cargaHoraria}h</span>
        </p>
        {status === STATUS_KEYS.CONCLUIDA && (
          <p className="text-sm items-center text-gray-600 leading-none flex justify-between font-semibold">
            Nota:{' '}
            <input
              type={'number'}
              value={nota ?? ''}
              min={0}
              step=".1"
              max={10}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleChangeNota(e.target.value)}
              className="block w-16 ml-auto rounded-md outline-indigo-700 border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 font-medium text-sm"
            />
          </p>
        )}
      </div>
    </div>
  )
}

export default DisciplinaBox
