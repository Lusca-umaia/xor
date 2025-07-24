import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  title: string
  value: string
}
const StatCard: React.FC<StatCardProps> = ({ title, icon, value }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl space-y-2 shadow-md p-6">
      <span className="text-base flex items-center gap-2">
        {icon}
        <div className="space-y-0.5">
          <h3 className="font-medium text-gray-600 leading-none tracking-tight">
            {title}
          </h3>
          <p className="text-3xl font-semibold">{value}</p>
        </div>
      </span>
    </div>
  )
}

export default StatCard
