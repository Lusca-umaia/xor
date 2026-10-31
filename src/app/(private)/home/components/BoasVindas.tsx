import Link from 'next/link'
import {
  LuArrowRight,
  LuCirclePlay,
  LuGraduationCap,
  LuTimer
} from 'react-icons/lu'
import { Me, ResumoProgresso } from '@/@types/Progresso'
import AnelProgresso from '@/components/AnelProgresso/AnelProgresso'
import CapaXor from '@/components/CapaXor/CapaXor'
import IconeTile from '@/components/IconeTile/IconeTile'
import Indicador from '@/components/Indicador/Indicador'
import Skeleton from '@/components/Skeleton/Skeleton'
import type { ResumoFoco } from '../../pomodoro/utils/estatisticas'

interface BoasVindasProps {
  aluno: Me
  resumo: ResumoProgresso
  // Indefinido enquanto as sessões de foco carregam.
  foco?: ResumoFoco
  metaDiaria: number
}

const BoasVindas: React.FC<BoasVindasProps> = ({
  aluno,
  resumo,
  foco,
  metaDiaria
}) => (
  <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
    <CapaXor className="px-6 py-7 max-md:px-4 max-md:py-5">
      <div className="flex flex-wrap items-end justify-between gap-4 pr-32 max-md:pr-24">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/70">
            Bem-vindo(a) de volta
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white max-md:text-2xl">
            Olá, {aluno.nome.split(' ')[0]}!
          </h1>
          <p className="flex items-center gap-1.5 text-sm font-medium text-white/70">
            <LuGraduationCap className="shrink-0" />
            {aluno.curso.nome} · {aluno.semestreAtual}º semestre
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/courseProgression"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-xor-navy shadow-sm hover:bg-gray-100"
          >
            Ver progressão
            <LuArrowRight />
          </Link>
          <Link
            href="/pomodoro"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 hover:bg-white/20"
          >
            <LuTimer />
            Iniciar foco
          </Link>
        </div>
      </div>
    </CapaXor>

    <div className="grid flex-1 grid-cols-1 content-center gap-3 p-6 max-md:p-4 sm:grid-cols-3">
      <Indicador
        label="Progresso geral"
        value={`${resumo.percentualGeral}%`}
        detalhe="do curso"
        icon={<AnelProgresso percentual={resumo.percentualGeral} />}
      />
      <Indicador
        label="Em andamento"
        value={resumo.emAndamento}
        detalhe={resumo.emAndamento === 1 ? 'disciplina' : 'disciplinas'}
        icon={
          <IconeTile>
            <LuCirclePlay />
          </IconeTile>
        }
      />
      <Indicador
        label="Foco hoje"
        carregando={!foco}
        value={foco && `${foco.hoje.pomodoros}/${metaDiaria}`}
        detalhe="pomodoros"
        icon={
          <IconeTile>
            <LuTimer />
          </IconeTile>
        }
      />
    </div>
  </section>
)

export const BoasVindasSkeleton = () => (
  <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
    <div className="h-32 animate-pulse bg-gray-200" />
    <div className="grid grid-cols-1 gap-3 p-6 max-md:p-4 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  </div>
)

export default BoasVindas
