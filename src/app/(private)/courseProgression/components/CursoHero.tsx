import clsx from 'clsx'
import Link from 'next/link'
import { ReactNode } from 'react'
import {
  LuBookCheck,
  LuBookOpen,
  LuCirclePlay,
  LuClock,
  LuIdCard,
  LuSparkles
} from 'react-icons/lu'
import { Me, ResumoProgresso } from '@/@types/Progresso'
import AnelProgresso from '@/components/AnelProgresso/AnelProgresso'
import CapaXor from '@/components/CapaXor/CapaXor'
import IconeTile from '@/components/IconeTile/IconeTile'
import Indicador from '@/components/Indicador/Indicador'
import Skeleton from '@/components/Skeleton/Skeleton'

interface BarraProgressoProps {
  titulo: string
  atual: number
  total: number | null
  cor: string
  // Exibido quando não há meta definida.
  semMeta?: ReactNode
}

const BarraProgresso: React.FC<BarraProgressoProps> = ({
  titulo,
  atual,
  total,
  cor,
  semMeta
}) => {
  const percentual = total ? Math.min((atual / total) * 100, 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold text-gray-900">{titulo}</span>
        <span className="font-medium text-gray-500">
          <span className="font-semibold text-gray-900">{atual}h</span>
          {total ? ` / ${total}h` : ''}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div
          style={{ width: `${percentual}%` }}
          className={clsx(
            'h-full rounded-full transition-[width] duration-700',
            cor
          )}
        />
      </div>
      {!total && semMeta}
    </div>
  )
}

interface CursoHeroProps {
  aluno: Me
  resumo: ResumoProgresso
}

const CursoHero: React.FC<CursoHeroProps> = ({ aluno, resumo }) => {
  // Mesma conta do percentual geral: optativas valem até a carga exigida.
  const cargaConcluida =
    resumo.cargaObrigatoriaConcluida +
    Math.min(resumo.cargaOptativaConcluida, resumo.cargaOptativaExigida ?? 0)
  const cargaRestante = Math.max(resumo.cargaTotal - cargaConcluida, 0)

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
      <CapaXor className="px-6 py-7 max-md:px-4 max-md:py-5">
        <div className="space-y-2 pr-32 max-md:pr-24">
          {aluno.curso.codigo && (
            <span className="inline-flex rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs font-semibold text-white/90 ring-1 ring-inset ring-white/20">
              {aluno.curso.codigo}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-white max-md:text-lg sm:text-3xl">
            {aluno.curso.nome}
          </h2>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-white/70">
            <span className="flex items-center gap-1.5">
              <LuIdCard />
              Matrícula {aluno.matricula ?? '-'}
            </span>
            <span className="flex items-center gap-1.5">
              <LuBookOpen />
              {aluno.semestreAtual}º semestre
            </span>
          </p>
        </div>
      </CapaXor>

      <div className="grid gap-6 p-6 max-md:p-4 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex items-center gap-4 lg:flex-col lg:px-4">
          <AnelProgresso
            percentual={resumo.percentualGeral}
            espessura={4}
            className="size-32 max-md:size-24"
          >
            <span className="text-3xl font-bold leading-none text-gray-900 max-md:text-2xl">
              {resumo.percentualGeral}%
            </span>
            <span className="mt-1 text-[11px] font-medium text-gray-500">
              concluído
            </span>
          </AnelProgresso>
          {resumo.cargaTotal > 0 && (
            <p className="text-sm text-gray-500 lg:max-w-40 lg:text-center">
              {cargaRestante > 0 ? (
                <>
                  Faltam{' '}
                  <strong className="text-gray-900">{cargaRestante}h</strong>{' '}
                  para concluir o curso
                </>
              ) : (
                'Carga horária do curso concluída'
              )}
            </p>
          )}
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 2xl:grid-cols-4 max-sm:grid-cols-1">
            <Indicador
              label="Obrigatórias"
              value={`${resumo.obrigatoriasConcluidas}/${resumo.obrigatoriasTotal}`}
              detalhe="concluídas"
              icon={
                <IconeTile>
                  <LuBookCheck />
                </IconeTile>
              }
            />
            <Indicador
              label="Optativas"
              value={resumo.optativasConcluidas}
              detalhe="concluídas"
              icon={
                <IconeTile>
                  <LuSparkles />
                </IconeTile>
              }
            />
            <Indicador
              label="Carga concluída"
              value={`${cargaConcluida}h`}
              detalhe={resumo.cargaTotal ? `de ${resumo.cargaTotal}h` : ''}
              icon={
                <IconeTile>
                  <LuClock />
                </IconeTile>
              }
            />
            <Indicador
              label="Em andamento"
              value={resumo.emAndamento}
              detalhe="disciplinas"
              icon={
                <IconeTile>
                  <LuCirclePlay />
                </IconeTile>
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <BarraProgresso
              titulo="Disciplinas obrigatórias"
              atual={resumo.cargaObrigatoriaConcluida}
              total={resumo.cargaObrigatoriaTotal}
              cor="bg-xor-navy"
            />
            <BarraProgresso
              titulo="Disciplinas optativas"
              atual={resumo.cargaOptativaConcluida}
              total={resumo.cargaOptativaExigida}
              cor="bg-xor-lime"
              semMeta={
                <p className="text-xs text-gray-500">
                  Sem carga optativa exigida.{' '}
                  <Link
                    href="/perfil"
                    className="font-semibold text-xor-navy hover:text-xor-slate"
                  >
                    Definir no perfil
                  </Link>
                </p>
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export const CursoHeroSkeleton = () => (
  <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
    <div className="h-36 animate-pulse bg-gray-200 max-md:h-28" />
    <div className="grid gap-6 p-6 max-md:p-4 lg:grid-cols-[auto_1fr] lg:items-center">
      <Skeleton className="size-32 rounded-full max-md:size-24 lg:mx-4" />
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 2xl:grid-cols-4 max-sm:grid-cols-1">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default CursoHero
