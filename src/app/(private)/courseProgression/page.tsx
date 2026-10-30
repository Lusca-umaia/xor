'use client'
import Header from '@/components/Header/Header'
import StatCard from '@/components/StatCard/StatCard'
import DisciplinaBox from '@/components/DisciplinaBox/DisciplinaBox'
import { GoGoal } from 'react-icons/go'
import { LuGraduationCap } from 'react-icons/lu'
import { FiClock } from 'react-icons/fi'
import { LuBookCheck } from 'react-icons/lu'
import { IoBookOutline } from 'react-icons/io5'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import ModalEncerrarSemestre from '@/components/ModalEncerrarCurso/ModalEncerrarCurso'
import ModalEditarDisciplina from '@/components/ModalEditarDisciplina/ModalEditarDisciplina'
import { useProgresso } from '@/hooks/queries/useProgresso'
import { DisciplinaProgresso } from '@/@types/Progresso'
import Skeleton, { SkeletonCard } from '@/components/Skeleton/Skeleton'

const ProgressoSkeleton = () => (
  <div className="space-y-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Skeleton className="h-8 w-80 max-w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
    <div className="bg-white border border-gray-100 max-md:p-4 rounded-2xl space-y-4 shadow-md p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-72 max-w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
      ))}
    </div>
    <Skeleton className="h-11 w-full rounded-xl" />
    <div className="bg-white border border-gray-100 max-md:p-4 rounded-2xl space-y-4 shadow-lg p-6">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  </div>
)

const TABS_KEYS = {
  ATUAL: 'ATUAL',
  PENDENTES: 'PENDENTES',
  CONCLUIDAS: 'CONCLUIDAS'
} as const

const TABS = [
  {
    label: 'Semestre atual',
    key: TABS_KEYS.ATUAL
  },
  {
    label: 'Pendentes',
    key: TABS_KEYS.PENDENTES
  },
  {
    label: 'Concluídas',
    key: TABS_KEYS.CONCLUIDAS
  }
]

function numeroDoPeriodo(periodo: string) {
  const ano = periodo.match(/^(\d{4})\.(\d)$/)
  if (ano) return Number(ano[1]) * 10 + Number(ano[2])
  const semestre = periodo.match(/^(\d+)º/)
  return semestre ? Number(semestre[1]) : Number.MAX_SAFE_INTEGER
}

const ProgressBar = ({
  titulo,
  atual,
  total
}: {
  titulo: string
  atual: number
  total: number | null
}) => (
  <div className="flex flex-col gap-1">
    <span className="flex justify-between gap-2">
      <p className="font-semibold max-lg:text-sm text-base">{titulo}</p>
      <p className="font-semibold max-lg:text-sm text-base">
        {total ? `${atual}/${total}h` : `${atual}h`}
      </p>
    </span>
    <div className="w-full rounded-full overflow-hidden bg-gray-200 h-2.5">
      <div
        style={{
          width: `${total ? Math.min((atual / total) * 100, 100) : 0}%`
        }}
        className="bg-black h-full"
      ></div>
    </div>
  </div>
)

function resumoTentativas({ reprovacoes, trancamentos }: DisciplinaProgresso) {
  const partes = [
    reprovacoes > 0 && `Reprovada ${reprovacoes}x`,
    trancamentos > 0 && `Trancada ${trancamentos}x`
  ].filter(Boolean)
  return partes.length ? partes.join(' · ') : null
}

const GrupoDisciplinas = ({
  titulo,
  disciplinas,
  onSelect
}: {
  titulo?: string
  disciplinas: DisciplinaProgresso[]
  onSelect: (disciplina: DisciplinaProgresso) => void
}) => (
  <div className="bg-white border max-md:p-4 border-gray-100 rounded-2xl space-y-4 shadow-lg p-6">
    {titulo && (
      <div className="flex gap-4 items-center">
        <h3 className="max-md:text-base text-xl font-bold leading-none tracking-tight">
          {titulo}
        </h3>
        <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
          {disciplinas.length} disciplina(s)
        </span>
      </div>
    )}
    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
      {disciplinas.map((disciplina) => (
        <DisciplinaBox
          key={disciplina.id}
          nome={disciplina.nome}
          codigo={disciplina.codigo}
          cargaHoraria={disciplina.cargaHoraria}
          carater={disciplina.carater}
          status={disciplina.status}
          nota={disciplina.nota}
          periodo={disciplina.periodo}
          situacao={resumoTentativas(disciplina)}
          onClick={() => onSelect(disciplina)}
        />
      ))}
    </div>
  </div>
)

const CourseProgressionPage = () => {
  const [currentTab, setCurrentTab] = useState<keyof typeof TABS_KEYS>(
    TABS_KEYS.ATUAL
  )
  const [openModal, setOpenModal] = useState(false)
  // id da disciplina em edição; 'nova' para criar.
  const [editando, setEditando] = useState<number | 'nova' | null>(null)
  const { data, isLoading, isError } = useProgresso()

  const grupos = useMemo(() => {
    const disciplinas = data?.disciplinas ?? []

    const concluidas = Map.groupBy(
      disciplinas.filter(({ status }) => status === 'CONCLUIDA'),
      ({ periodo }) => periodo ?? 'Sem período'
    )

    return {
      ativas: disciplinas.filter(({ status }) => status === 'ANDAMENTO'),
      pendentes: disciplinas.filter(({ status }) => status === 'PENDENTE'),
      concluidasPorPeriodo: [...concluidas.entries()].sort(
        ([a], [b]) => numeroDoPeriodo(a) - numeroDoPeriodo(b)
      )
    }
  }, [data])

  if (isLoading) {
    return <ProgressoSkeleton />
  }

  if (isError || !data) {
    return (
      <p className="text-sm font-medium text-red-600">
        Não foi possível carregar seu progresso.
      </p>
    )
  }

  const { aluno, resumo } = data
  const pendentesObrigatorias = grupos.pendentes.filter(
    ({ carater }) => carater === 'OBRIGATORIA'
  )
  const pendentesOptativas = grupos.pendentes.filter(
    ({ carater }) => carater === 'OPTATIVA'
  )

  return (
    <div>
      <Header
        title={`Olá, ${aluno.nome.split(' ')[0]}, veja o seu progresso!`}
        actions={{
          primaryAction: {
            title: 'Adicionar disciplina',
            onClick: () => setEditando('nova')
          },
          secondaryAction: {
            title: 'Encerrar semestre',
            onClick: () => setOpenModal(true)
          }
        }}
      />
      <ModalEditarDisciplina
        open={editando !== null}
        onClose={() => setEditando(null)}
        disciplina={data.disciplinas.find(({ id }) => id === editando)}
      />
      <ModalEncerrarSemestre
        semestreAtual={aluno.semestreAtual}
        cadeirasAtivas={grupos.ativas}
        disponiveis={grupos.pendentes}
        open={openModal}
        setOpen={setOpenModal}
      />
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 max-md:p-4 rounded-2xl space-y-4 shadow-md p-6">
          <span className="text-2xl flex items-center gap-2">
            <LuGraduationCap className="max-lg:text-2xl text-4xl" />
            <div className="space-y-0.5">
              <h3 className="font-semibold max-md:text-lg leading-none tracking-tight">
                {aluno.curso.nome}
                {aluno.curso.codigo && ` - ${aluno.curso.codigo}`}
              </h3>
              <p className="text-base max-md:text-sm font-semibold">
                Matrícula:{' '}
                <span className="font-normal">{aluno.matricula ?? '-'}</span>
                {' · '}
                <span className="font-normal">
                  {aluno.semestreAtual}º semestre
                </span>
              </p>
            </div>
          </span>
          <div className="grid grid-cols-1  lg:grid-cols-2 2xl:grid-cols-4 gap-4">
            <StatCard
              title="Progresso geral"
              value={`${resumo.percentualGeral}%`}
              icon={
                <GoGoal className="max-lg:text-xl shrink-0 text-3xl text-blue-600" />
              }
            />
            <StatCard
              title="Obrigatórias"
              value={`${resumo.obrigatoriasConcluidas}/${resumo.obrigatoriasTotal}`}
              icon={
                <LuBookCheck className="max-lg:text-xl shrink-0 text-3xl text-green-600" />
              }
            />
            <StatCard
              title="Optativas"
              value={`${resumo.optativasConcluidas} concluída(s)`}
              icon={
                <IoBookOutline className="max-lg:text-xl shrink-0 text-3xl text-indigo-600" />
              }
            />
            <StatCard
              title="Carga horária"
              value={`${resumo.cargaTotal}h`}
              icon={
                <FiClock className="max-lg:text-xl shrink-0 text-3xl text-orange-600" />
              }
            />
          </div>
          <ProgressBar
            titulo="Disciplinas Obrigatórias"
            atual={resumo.cargaObrigatoriaConcluida}
            total={resumo.cargaObrigatoriaTotal}
          />
          <ProgressBar
            titulo="Disciplinas Optativas"
            atual={resumo.cargaOptativaConcluida}
            total={resumo.cargaOptativaExigida}
          />
        </div>
        <div className="bg-white border border-gray-100 rounded-xl space-y-4 shadow-lg p-1">
          <div className="grid max-md:grid-cols-1 grid-cols-3">
            {TABS.map(({ key, label }) => (
              <div
                onClick={() => setCurrentTab(key)}
                key={key}
                className={clsx(
                  'bg-white max-md:text-sm text-center cursor-pointer col-span-1 rounded-md text-base space-y-2 py-2 px-8',
                  {
                    'border border-gray-100 shadow-sm font-semibold':
                      currentTab === key,
                    'text-gray-600 font-medium': currentTab !== key
                  }
                )}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {currentTab === TABS_KEYS.ATUAL &&
          (grupos.ativas.length > 0 ? (
            <GrupoDisciplinas
              onSelect={({ id }) => setEditando(id)}
              titulo={`${aluno.semestreAtual}º semestre`}
              disciplinas={grupos.ativas}
            />
          ) : (
            <p className="text-sm text-gray-500">
              Nenhuma disciplina em andamento. Use “Encerrar semestre” para
              escolher as disciplinas do próximo.
            </p>
          ))}

        {currentTab === TABS_KEYS.PENDENTES && (
          <>
            {pendentesObrigatorias.length > 0 && (
              <GrupoDisciplinas
                onSelect={({ id }) => setEditando(id)}
                titulo="Obrigatórias"
                disciplinas={pendentesObrigatorias}
              />
            )}
            {pendentesOptativas.length > 0 && (
              <GrupoDisciplinas
                onSelect={({ id }) => setEditando(id)}
                titulo="Optativas"
                disciplinas={pendentesOptativas}
              />
            )}
            {grupos.pendentes.length === 0 && (
              <p className="text-sm text-gray-500">
                Nenhuma disciplina pendente.
              </p>
            )}
          </>
        )}

        {currentTab === TABS_KEYS.CONCLUIDAS &&
          (grupos.concluidasPorPeriodo.length > 0 ? (
            grupos.concluidasPorPeriodo.map(([periodo, disciplinas]) => (
              <GrupoDisciplinas
                onSelect={({ id }) => setEditando(id)}
                key={periodo}
                titulo={periodo}
                disciplinas={disciplinas}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Nenhuma disciplina concluída ainda.
            </p>
          ))}
      </div>
    </div>
  )
}

export default CourseProgressionPage
