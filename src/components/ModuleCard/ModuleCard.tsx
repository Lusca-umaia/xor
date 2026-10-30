import Link from 'next/link'
import { ReactNode } from 'react'
import { LuArrowUpRight } from 'react-icons/lu'
import IconeTile from '../IconeTile/IconeTile'

interface ModuleCardProps {
  nome: string
  descricao: string
  path: string
  icon: ReactNode
}

// Atalho para um módulo do sistema; o card inteiro é o link.
const ModuleCard: React.FC<ModuleCardProps> = ({
  descricao,
  nome,
  path,
  icon
}) => (
  <Link
    href={path}
    className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
  >
    <IconeTile className="transition-colors duration-200 group-hover:bg-xor-navy group-hover:text-white">
      {icon}
    </IconeTile>
    <div className="min-w-0 flex-1 space-y-1">
      <h3 className="font-bold leading-tight tracking-tight text-gray-900">
        {nome}
      </h3>
      <p className="line-clamp-2 text-sm text-gray-500">{descricao}</p>
    </div>
    <LuArrowUpRight className="shrink-0 text-lg text-gray-300 transition-colors group-hover:text-xor-navy" />
  </Link>
)

export default ModuleCard
