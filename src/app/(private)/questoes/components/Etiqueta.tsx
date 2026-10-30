import clsx from 'clsx'
import { ReactNode } from 'react'

const TONS = {
  neutro: 'bg-gray-50 text-gray-700 ring-gray-200',
  ia: 'bg-xor-lime/15 text-xor-navy ring-xor-lime/60',
  sucesso: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  alerta: 'bg-amber-50 text-amber-700 ring-amber-200',
  erro: 'bg-red-50 text-red-700 ring-red-200'
} as const

interface EtiquetaProps {
  children: ReactNode
  icon?: ReactNode
  tom?: keyof typeof TONS
  title?: string
  className?: string
}

const Etiqueta: React.FC<EtiquetaProps> = ({
  children,
  icon,
  tom = 'neutro',
  title,
  className
}) => (
  <span
    title={title}
    className={clsx(
      'inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
      TONS[tom],
      className
    )}
  >
    {icon}
    <span className="truncate">{children}</span>
  </span>
)

export default Etiqueta
