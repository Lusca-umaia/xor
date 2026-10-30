import clsx from 'clsx'
import { ReactNode } from 'react'
import Skeleton from '../Skeleton/Skeleton'

interface IndicadorProps {
  icon: ReactNode
  label: string
  value?: ReactNode
  // Texto menor ao lado do valor (ex.: "de 3200h").
  detalhe?: string
  carregando?: boolean
  className?: string
}

// Número em destaque com rótulo, usado nos topos de perfil e progressão.
const Indicador: React.FC<IndicadorProps> = ({
  icon,
  label,
  value,
  detalhe,
  carregando = false,
  className
}) => (
  <div
    className={clsx(
      'flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-inset ring-gray-100',
      className
    )}
  >
    {icon}
    <div className="min-w-0 space-y-1">
      <p className="truncate text-xs font-medium leading-none text-gray-500">
        {label}
      </p>
      {carregando ? (
        <Skeleton className="h-6 w-12" />
      ) : (
        <p className="truncate leading-none">
          <span className="text-xl font-bold text-gray-900">
            {value ?? '-'}
          </span>
          {detalhe && (
            <span className="ml-1 text-xs font-medium text-gray-500">
              {detalhe}
            </span>
          )}
        </p>
      )}
    </div>
  </div>
)

export default Indicador
