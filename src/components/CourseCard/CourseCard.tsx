import { ReactNode } from 'react'

import clsx from 'clsx'
import { VscVerified } from 'react-icons/vsc'
import { LuCirclePlay } from 'react-icons/lu'
import { LuCircle } from 'react-icons/lu'

export const STATUS_KEYS = {
  PENDENTE: 'PENDENTE',
  CONCLUIDA: 'CONCLUIDA',
  ANDAMENTO: 'ANDAMENTO'
} as const

interface CourseCardProps {
  nome: string
  codigo: string
  carater: 'OBRIGATÓRIA' | 'OPTATIVA'
  status: keyof typeof STATUS_KEYS
  nota?: number
}

const CARD_ICON: Record<CourseCardProps['status'], ReactNode> = {
  [STATUS_KEYS.CONCLUIDA]: (
    <VscVerified className={`shrink-0 text-2xl text-green-600`} />
  ),
  [STATUS_KEYS.PENDENTE]: <LuCircle className="shrink-0 text-xl text-black" />,
  [STATUS_KEYS.ANDAMENTO]: (
    <LuCirclePlay className="shrink-0 text-2xl text-blue-600" />
  )
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
  ),
  [STATUS_KEYS.ANDAMENTO]: (
    <span className="self-start shrink-0 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
      Em andamento
    </span>
  )
}

const CourseCard: React.FC<CourseCardProps> = ({
  codigo,
  nome,
  carater,
  status,
  nota
}) => {
  return (
    <div
      className={clsx(
        'border-l-[6px]  flex flex-col bg-white rounded-2xl rounded-l-lg space-y-3 shadow-md p-4',
        {
          'border-orange-300': carater === 'OPTATIVA',
          'border-green-600': status === STATUS_KEYS.CONCLUIDA,
          'border-black': status === STATUS_KEYS.PENDENTE,
          'border-blue-600': status === STATUS_KEYS.ANDAMENTO
        }
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-base flex items-center gap-2">
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
          Carga horária: <span className="font-medium">90h</span>
        </p>
        <p className="text-sm text-gray-600 leading-none flex justify-between font-semibold">
          Nota:{' '}
          <span className="font-medium text-green-600">{nota ?? '-'}</span>
        </p>
      </div>
    </div>
  )
}

export default CourseCard
