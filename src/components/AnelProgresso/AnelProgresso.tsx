import clsx from 'clsx'
import { ReactNode } from 'react'

interface AnelProgressoProps {
  percentual: number
  // Tamanho do anel (ex.: size-11). A espessura é relativa a ele.
  className?: string
  espessura?: number
  // Conteúdo centralizado dentro do anel.
  children?: ReactNode
}

const AnelProgresso: React.FC<AnelProgressoProps> = ({
  percentual,
  className = 'size-11',
  espessura = 5,
  children
}) => {
  const raio = 24 - espessura / 2 - 1
  const circunferencia = 2 * Math.PI * raio
  const preenchido = Math.min(Math.max(percentual, 0), 100) / 100

  return (
    <div className={clsx('relative shrink-0', className)}>
      <svg
        viewBox="0 0 48 48"
        className="size-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r={raio}
          fill="none"
          strokeWidth={espessura}
          className="stroke-gray-200"
        />
        <circle
          cx="24"
          cy="24"
          r={raio}
          fill="none"
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - preenchido)}
          className="stroke-xor-lime transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

export default AnelProgresso
