'use client'
import { ReactNode } from 'react'
import { LuCalendar, LuClock } from 'react-icons/lu'
import { STATUS_KEYS } from '../CourseCard/CourseCard'

interface DisciplineCardProps {
  nome: string
  status: (typeof STATUS_KEYS)['ANDAMENTO'] | (typeof STATUS_KEYS)['CONCLUIDA']
  codigo?: string
  cargaHoraria?: number
  periodo?: string | null
  // Situação no ambiente de estudo e próximo passo (tela inicial).
  estudo?: ReactNode
  // Botão que leva ao ambiente de estudo da cadeira.
  acaoEstudo?: ReactNode
}

const CARD_STATUS_INFORMATION = {
  [STATUS_KEYS.CONCLUIDA]: {
    label: 'Concluída',
    destaque: 'bg-xor-lime',
    selo: 'bg-lime-50 text-lime-800 ring-lime-600/20',
    ponto: 'bg-lime-500'
  },
  [STATUS_KEYS.ANDAMENTO]: {
    label: 'Em andamento',
    destaque: 'bg-xor-navy',
    selo: 'bg-xor-navy/5 text-xor-navy ring-xor-navy/20',
    ponto: 'bg-xor-navy'
  }
}

const DisciplineCard: React.FC<DisciplineCardProps> = ({
  nome,
  status,
  codigo,
  cargaHoraria,
  periodo,
  estudo,
  acaoEstudo
}) => {
  const { label, destaque, selo, ponto } = CARD_STATUS_INFORMATION[status]
  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 pt-6 shadow-sm transition duration-200 hover:border-gray-200 hover:shadow-lg">
      <span
        aria-hidden="true"
        className={`absolute top-0 left-5 h-1 w-10 rounded-b-full ${destaque}`}
      />
      <div className="flex items-center justify-between gap-2">
        {codigo && (
          <span className="truncate font-mono text-xs font-semibold text-gray-500">
            {codigo}
          </span>
        )}
        <span
          className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${selo}`}
        >
          <span className={`size-1.5 rounded-full ${ponto}`} />
          {label}
        </span>
      </div>

      <div className="space-y-2">
        <h3
          title={nome}
          className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-gray-900"
        >
          {nome}
        </h3>
        {(cargaHoraria !== undefined || periodo) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-gray-500">
            {cargaHoraria !== undefined && (
              <span className="flex items-center gap-1">
                <LuClock className="text-gray-400" />
                {cargaHoraria}h
              </span>
            )}
            {periodo && (
              <span className="flex items-center gap-1">
                <LuCalendar className="text-gray-400" />
                {periodo}
              </span>
            )}
          </div>
        )}
      </div>

      {estudo}

      <div className="mt-auto flex gap-2">{acaoEstudo}</div>
    </div>
  )
}

export default DisciplineCard
