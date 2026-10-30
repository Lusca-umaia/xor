import { ReactNode } from 'react'
import { GoGoal } from 'react-icons/go'
import { LuGraduationCap } from 'react-icons/lu'
import { RiProgress2Line } from 'react-icons/ri'
import Skeleton from '../Skeleton/Skeleton'

interface QuickStatsProps {
  curso?: string
  semestre?: number
  progresso?: number
  carregando?: boolean
}

const QuickStats: React.FC<QuickStatsProps> = ({
  curso,
  semestre,
  progresso,
  carregando = false
}) => {
  const statistics: { label: string; value?: ReactNode; icon?: ReactNode }[] = [
    { label: 'Curso', value: curso },
    {
      label: 'Semestre',
      icon: <LuGraduationCap className="text-base" />,
      value: semestre && `${semestre}º`
    },
    {
      label: 'Progresso',
      icon: <RiProgress2Line className="text-base" />,
      value: progresso !== undefined && `${progresso}%`
    }
  ]

  return (
    <div className="2xl:sticky 2xl:top-4 col-span-1 bg-white border border-gray-100 rounded-2xl space-y-6 shadow-lg p-6">
      <span className="text-xl max-md:text-base flex items-center gap-2">
        <GoGoal className="max-md:text-xl text-muted-foreground" />
        <h3 className=" font-bold leading-none tracking-tight">
          Estatísticas rápidas
        </h3>
      </span>

      <div className="space-y-2">
        {statistics.map((statistic) => (
          <span
            key={statistic.label}
            className="flex items-center justify-between font-semibold text-sm leading-none gap-4"
          >
            <p>{statistic.label}</p>
            {carregando ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <span className="inline-flex items-center gap-x-1 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                {statistic.icon && statistic.icon}
                {statistic.value || '-'}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

export default QuickStats
