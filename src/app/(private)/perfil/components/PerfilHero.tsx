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
import AnelProgresso from '@/components/AnelProgresso/AnelProgresso'
import Avatar from '@/components/Avatar/Avatar'
import CapaXor from '@/components/CapaXor/CapaXor'
import Indicador from '@/components/Indicador/Indicador'
import Skeleton from '@/components/Skeleton/Skeleton'
import { useProgresso } from '@/hooks/queries/useProgresso'

const Chip: React.FC<{ icon: ReactNode; children: ReactNode }> = ({
  icon,
  children
}) => (
  <span className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
    {icon}
    {children}
  </span>
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
      <CapaXor className="h-36 max-md:h-28" />
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
            className="min-w-36 flex-1"
            carregando={isLoading}
            label="Progresso geral"
            value={resumo && `${resumo.percentualGeral}%`}
            icon={<AnelProgresso percentual={resumo?.percentualGeral ?? 0} />}
          />
          <Indicador
            className="min-w-36 flex-1"
            carregando={isLoading}
            label="Concluídas"
            value={
              resumo &&
              resumo.obrigatoriasConcluidas + resumo.optativasConcluidas
            }
            icon={<MdOutlineDoneAll className="text-2xl text-xor-navy" />}
          />
          <Indicador
            className="min-w-36 flex-1"
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
