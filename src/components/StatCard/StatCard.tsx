import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  title: string
  value: string
}
const StatCard: React.FC<StatCardProps> = ({ title, icon, value }) => {
  return (
    <div className="bg-white border max-lg:px-4 max-lg:py-3 border-gray-100 rounded-2xl space-y-2 shadow-md p-6">
      <span className="max-lg:text-sm text-base flex items-center gap-2">
        {icon}
        <div className="space-y-0.5">
          <h3 className="font-medium text-gray-600 leading-none tracking-tight">
            {title}
          </h3>
          <p className="max-lg:text-xl text-3xl font-semibold">{value}</p>
        </div>
      </span>
    </div>
  )
}

export default StatCard
