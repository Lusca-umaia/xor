import clsx from 'clsx'
import { tomDoPercentual } from '@/utils/questionarios'

interface AnelProgressoProps {
  valor: number
  tamanho?: number
  espessura?: number
  className?: string
  children?: React.ReactNode
}

// Círculo de progresso em SVG, colorido conforme o percentual.
const AnelProgresso: React.FC<AnelProgressoProps> = ({
  valor,
  tamanho = 120,
  espessura = 10,
  className,
  children
}) => {
  const raio = (tamanho - espessura) / 2
  const circunferencia = 2 * Math.PI * raio
  const preenchido = (Math.min(Math.max(valor, 0), 100) / 100) * circunferencia

  return (
    <div
      className={clsx('relative shrink-0', className)}
      style={{ width: tamanho, height: tamanho }}
    >
      <svg
        width={tamanho}
        height={tamanho}
        className={clsx('-rotate-90', tomDoPercentual(valor))}
        aria-hidden="true"
      >
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          strokeWidth={espessura}
          className="stroke-gray-100"
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={`${preenchido} ${circunferencia}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? <span className="text-2xl font-bold">{valor}%</span>}
      </div>
    </div>
  )
}

export default AnelProgresso
