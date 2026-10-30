'use client'

import { ReactNode } from 'react'
import {
  LuBookOpen,
  LuCalendar,
  LuGraduationCap,
  LuIdCard,
  LuMail
} from 'react-icons/lu'
import { MdOutlineDoneAll } from 'react-icons/md'
import { RiProgress2Line } from 'react-icons/ri'
import { Perfil } from '@/@types/Perfil'
import Avatar from '@/components/Avatar/Avatar'
import Skeleton from '@/components/Skeleton/Skeleton'
import { useProgresso } from '@/hooks/queries/useProgresso'

const RAIO = 20
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

const AnelProgresso: React.FC<{ percentual: number }> = ({ percentual }) => (
  <svg viewBox="0 0 48 48" className="size-11 -rotate-90" aria-hidden="true">
    <circle
      cx="24"
      cy="24"
      r={RAIO}
      fill="none"
      strokeWidth="5"
      className="stroke-gray-200"
    />
    <circle
      cx="24"
      cy="24"
      r={RAIO}
      fill="none"
      strokeWidth="5"
      strokeLinecap="round"
      strokeDasharray={CIRCUNFERENCIA}
      strokeDashoffset={CIRCUNFERENCIA * (1 - Math.min(percentual, 100) / 100)}
      className="stroke-xor-lime transition-[stroke-dashoffset] duration-700"
    />
  </svg>
)

interface IndicadorProps {
  icon: ReactNode
  label: string
  value?: string | number
  carregando: boolean
}

const Indicador: React.FC<IndicadorProps> = ({
  icon,
  label,
  value,
  carregando
}) => (
  <div className="flex min-w-36 flex-1 items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-inset ring-gray-100">
    {icon}
    <div className="space-y-1">
      <p className="text-xs font-medium leading-none text-gray-500">{label}</p>
      {carregando ? (
        <Skeleton className="h-6 w-12" />
      ) : (
        <p className="text-xl font-bold leading-none text-gray-900">
          {value ?? '-'}
        </p>
      )}
    </div>
  </div>
)

const Chip: React.FC<{ icon: ReactNode; children: ReactNode }> = ({
  icon,
  children
}) => (
  <span className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
    {icon}
    {children}
  </span>
)

// Faixa do topo nas cores do logo, com os degraus e a seta de evolução.
const Capa = () => (
  <div className="relative h-36 overflow-hidden bg-linear-to-br from-xor-navy via-xor-navy to-xor-slate max-md:h-28">
    <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
    <div className="absolute -top-24 -right-16 size-72 rounded-full bg-xor-lime/30 blur-3xl" />
    <div className="absolute -bottom-28 left-1/4 size-64 rounded-full bg-xor-slate/60 blur-3xl" />
    <svg
      viewBox="0 0 120 80"
      aria-hidden="true"
      className="absolute right-6 bottom-0 h-28 max-md:h-20"
    >
      <path d="M0 80V58h26V38h26V18h26v62z" className="fill-white/10" />
      <g
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-xor-lime"
      >
        <path d="M60 44 94 12" />
        <path d="M78 8h18v18" />
      </g>
    </svg>
  </div>
)

const formatoMes = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric'
})

const PerfilHero: React.FC<{ perfil: Perfil }> = ({ perfil }) => {
  const { data: progresso, isLoading } = useProgresso()
  const resumo = progresso?.resumo

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
      <Capa />
      <div className="flex flex-col gap-6 px-6 pb-6 max-md:px-4 max-md:pb-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex items-end gap-4">
            {/* Só o avatar sobe sobre a capa; o nome fica abaixo dela. */}
            <div className="relative -mt-12 shrink-0 max-md:-mt-10">
              <Avatar
                nome={perfil.nome}
                className="size-24 text-3xl shadow-lg ring-4 ring-white max-md:size-20 max-md:text-2xl"
              />
              <span
                title="Conta ativa"
                className="absolute right-1 bottom-1 size-4 rounded-full bg-xor-lime ring-4 ring-white"
              />
            </div>
            <div className="min-w-0 pt-3 pb-1">
              <h2 className="truncate text-2xl font-bold tracking-tight text-gray-900 max-md:text-lg sm:text-3xl">
                {perfil.nome}
              </h2>
              <p className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <LuMail className="shrink-0" />
                <span className="truncate">{perfil.email}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip icon={<LuGraduationCap className="text-sm" />}>
              {perfil.cursoNome}
            </Chip>
            {perfil.matricula && (
              <Chip icon={<LuIdCard className="text-sm" />}>
                Matrícula {perfil.matricula}
              </Chip>
            )}
            <Chip icon={<LuBookOpen className="text-sm" />}>
              {perfil.semestreAtual}º semestre
            </Chip>
            <Chip icon={<LuCalendar className="text-sm" />}>
              Desde {formatoMes.format(new Date(perfil.criadoEm))}
            </Chip>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 xl:flex-nowrap">
          <Indicador
            carregando={isLoading}
            label="Progresso geral"
            value={resumo && `${resumo.percentualGeral}%`}
            icon={<AnelProgresso percentual={resumo?.percentualGeral ?? 0} />}
          />
          <Indicador
            carregando={isLoading}
            label="Concluídas"
            value={
              resumo &&
              resumo.obrigatoriasConcluidas + resumo.optativasConcluidas
            }
            icon={<MdOutlineDoneAll className="text-2xl text-xor-navy" />}
          />
          <Indicador
            carregando={isLoading}
            label="Em andamento"
            value={resumo?.emAndamento}
            icon={<RiProgress2Line className="text-2xl text-xor-navy" />}
          />
        </div>
      </div>
    </section>
  )
}

export const PerfilHeroSkeleton = () => (
  <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
    <div className="h-36 animate-pulse bg-gray-200 max-md:h-28" />
    <div className="space-y-4 px-6 pb-6 max-md:px-4">
      <div className="flex items-end gap-4">
        <Skeleton className="-mt-12 size-24 shrink-0 rounded-full ring-4 ring-white max-md:-mt-10 max-md:size-20" />
        <div className="space-y-2 pt-3 pb-1">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-6 w-28" />
        ))}
      </div>
    </div>
  </div>
)

export default PerfilHero
