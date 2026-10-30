import clsx from 'clsx'
import { formatarTempo, ModoTimer, MODOS } from '../consts'

const RAIO = 140
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

interface TimerCircularProps {
  modo: ModoTimer
  restante: number
  total: number
  rodando: boolean
  ciclo: number
  ciclosAtePausaLonga: number
  className?: string
}

const TimerCircular: React.FC<TimerCircularProps> = ({
  modo,
  restante,
  total,
  rodando,
  ciclo,
  ciclosAtePausaLonga,
  className
}) => {
  const { label, icon: Icon, traco, texto } = MODOS[modo]
  const progresso = total ? (total - restante) / total : 0

  return (
    <div
      className={clsx('relative mx-auto aspect-square w-full', className)}
      role="timer"
      aria-label={`${label}: ${formatarTempo(restante)} restantes`}
    >
      <svg viewBox="0 0 320 320" className="size-full -rotate-90">
        <circle
          cx="160"
          cy="160"
          r={RAIO}
          fill="none"
          strokeWidth="14"
          className="stroke-gray-200/70"
        />
        <circle
          cx="160"
          cy="160"
          r={RAIO}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - progresso)}
          className={clsx(
            traco,
            'transition-[stroke-dashoffset] duration-500 ease-linear'
          )}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span
          className={clsx(
            'flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest',
            texto
          )}
        >
          <Icon className={clsx('text-base', rodando && 'animate-pulse')} />
          {label}
        </span>
        <p className="text-6xl sm:text-7xl font-semibold tabular-nums tracking-tight text-gray-900">
          {formatarTempo(restante)}
        </p>
        <div
          className="flex items-center gap-1.5"
          title={`${ciclo} de ${ciclosAtePausaLonga} pomodoros até a pausa longa`}
        >
          {Array.from({ length: ciclosAtePausaLonga }, (_, i) => (
            <span
              key={i}
              className={clsx(
                'size-2.5 rounded-full transition-colors',
                i < ciclo
                  ? 'bg-xor-lime ring-1 ring-xor-navy/20'
                  : i === ciclo && modo === 'FOCO' && rodando
                    ? 'animate-pulse bg-gray-400'
                    : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimerCircular
