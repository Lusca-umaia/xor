import { ReactNode } from 'react'
import { BsLightningCharge } from 'react-icons/bs'
import { FaFireAlt } from 'react-icons/fa'
import { GoGoal } from 'react-icons/go'
import { LuGraduationCap } from 'react-icons/lu'
import Streak from './Streak/Streak'

interface Statistic {
  label: string
  propertyName: 'curso' | 'semestre' | 'xp'
  icon?: ReactNode
}

const statistics: Statistic[] = [
  {
    label: 'Curso',
    propertyName: 'curso'
  },
  {
    label: 'Semestre',
    icon: <LuGraduationCap className="text-base" />,
    propertyName: 'semestre'
  },
  {
    label: 'XP',
    icon: <BsLightningCharge className="text-base" />,
    propertyName: 'xp'
  }
] as const

const mockData = {
  curso: 'Ciência da Computação',
  semestre: 4,
  xp: 2000
}

const QuickStats = () => {
  return (
    <div className="2xl:sticky 2xl:top-4 col-span-1 bg-white border border-gray-100 rounded-2xl space-y-6 shadow-lg p-6">
      <span className="text-xl flex items-center gap-2">
        <GoGoal className="text-muted-foreground" />
        <h3 className=" font-bold leading-none tracking-tight">
          Estatísticas rápidas
        </h3>
      </span>

      <div className="space-y-2">
        {statistics.map((statistic) => (
          <span
            key={statistic.propertyName}
            className="flex items-center justify-between font-semibold text-sm leading-none gap-4"
          >
            <p>{statistic.label}</p>
            <span className="inline-flex items-center gap-x-1 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
              {statistic.icon && statistic.icon}
              {mockData[statistic.propertyName]}
            </span>
          </span>
        ))}
      </div>
      <Streak />
    </div>
  )
}

export default QuickStats
