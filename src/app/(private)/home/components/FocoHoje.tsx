import Link from 'next/link'
import { LuFlame, LuTimer, LuTrophy } from 'react-icons/lu'
import IconeTile from '@/components/IconeTile/IconeTile'
import Skeleton from '@/components/Skeleton/Skeleton'
import { formatarDuracao } from '../../pomodoro/consts'
import type { ResumoFoco } from '../../pomodoro/utils/estatisticas'

interface FocoHojeProps {
  // Indefinido enquanto as sessões de foco carregam.
  foco?: ResumoFoco
  metaDiaria: number
}

const FocoHoje: React.FC<FocoHojeProps> = ({ foco, metaDiaria }) => {
  const percentual = foco
    ? Math.min((foco.hoje.pomodoros / Math.max(metaDiaria, 1)) * 100, 100)
    : 0

  return (
    <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg max-md:p-4">
      <header className="flex items-center gap-3">
        <IconeTile>
          <LuTimer />
        </IconeTile>
        <div>
          <h2 className="text-lg font-bold leading-tight tracking-tight max-md:text-base">
            Foco de hoje
          </h2>
          <p className="text-sm text-gray-500">
            Meta de {metaDiaria} pomodoros
          </p>
        </div>
      </header>

      {foco ? (
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <p className="leading-none">
              <span className="text-3xl font-bold text-gray-900">
                {foco.hoje.pomodoros}
              </span>
              <span className="text-sm font-medium text-gray-500">
                {' '}
                / {metaDiaria}
              </span>
            </p>
            <p className="text-sm font-medium text-gray-500">
              {formatarDuracao(foco.hoje.segundos)} de foco
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              style={{ width: `${percentual}%` }}
              className="h-full rounded-full bg-xor-lime transition-[width] duration-700"
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1">
              <LuFlame className="text-amber-500" />
              Sequência de {foco.sequenciaAtual}{' '}
              {foco.sequenciaAtual === 1 ? 'dia' : 'dias'}
            </span>
            <span className="flex items-center gap-1">
              <LuTrophy className="text-gray-400" />
              Recorde de {foco.melhorSequencia}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
      )}

      <Link
        href="/pomodoro"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-xor-navy px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-xor-navy/90"
      >
        <LuTimer />
        Iniciar foco
      </Link>
    </section>
  )
}

export default FocoHoje
