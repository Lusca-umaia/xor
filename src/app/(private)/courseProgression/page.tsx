'use client'
import Header from '@/components/Header/Header'
import clsx from 'clsx'
import { ReactNode, useMemo, useState } from 'react'
import {
  LuBookOpen,
  LuCalendarCheck,
  LuCircleCheck,
  LuCirclePlay,
  LuHourglass,
  LuListTodo,
  LuSparkles
} from 'react-icons/lu'
import ModalEncerrarSemestre from '@/components/ModalEncerrarCurso/ModalEncerrarCurso'
import ModalEditarDisciplina from '@/components/ModalEditarDisciplina/ModalEditarDisciplina'
import { useProgresso } from '@/hooks/queries/useProgresso'
import Skeleton from '@/components/Skeleton/Skeleton'
import CursoHero, { CursoHeroSkeleton } from './components/CursoHero'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import GrupoDisciplinas, {
  GrupoDisciplinasSkeleton
} from './components/GrupoDisciplinas'

const ProgressoSkeleton = () => (
  <div className="space-y-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Skeleton className="h-8 w-80 max-w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
    <CursoHeroSkeleton />
    <Skeleton className="h-11 w-96 max-w-full rounded-full" />
    <GrupoDisciplinasSkeleton />
  </div>
)

const TABS_KEYS = {
  ATUAL: 'ATUAL',
  PENDENTES: 'PENDENTES',
  CONCLUIDAS: 'CONCLUIDAS'
} as const

const TABS: {
  label: string
  key: keyof typeof TABS_KEYS
  icon: ReactNode
}[] = [
  {
    label: 'Semestre atual',
    key: TABS_KEYS.ATUAL,
    icon: <LuCirclePlay />
  },
  {
    label: 'Pendentes',
    key: TABS_KEYS.PENDENTES,
    icon: <LuHourglass />
  },
  {
    label: 'Concluídas',
    key: TABS_KEYS.CONCLUIDAS,
    icon: <LuCircleCheck />
  }
]

function numeroDoPeriodo(periodo: string) {
  const ano = periodo.match(/^(\d{4})\.(\d)$/)
  if (ano) return Number(ano[1]) * 10 + Number(ano[2])
  const semestre = periodo.match(/^(\d+)º/)
  return semestre ? Number(semestre[1]) : Number.MAX_SAFE_INTEGER
}

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
  const contagem: Record<keyof typeof TABS_KEYS, number> = {
    ATUAL: grupos.ativas.length,
    PENDENTES: grupos.pendentes.length,
    CONCLUIDAS: grupos.concluidasPorPeriodo.reduce(
      (acc, [, disciplinas]) => acc + disciplinas.length,
      0
    )
  }
  const selecionar = ({ id }: { id: number }) => setEditando(id)

  return (
    <div>
      <Header
        title={`Olá, ${aluno.nome.split(' ')[0]}, veja o seu progresso!`}
        description="Acompanhe sua grade, registre resultados e planeje os próximos semestres."
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
        <CursoHero aluno={aluno} resumo={resumo} />

        <div
          role="tablist"
          className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-gray-100 bg-white p-1 shadow-lg"
        >
          {TABS.map(({ key, label, icon }) => {
            const ativa = currentTab === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => setCurrentTab(key)}
                className={clsx(
                  'flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold duration-200 max-md:px-3',
                  ativa
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <span className="text-base max-sm:hidden">{icon}</span>
                {label}
                <span
                  className={clsx(
                    'rounded-full px-1.5 py-0.5 text-[11px] leading-none',
                    ativa
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {contagem[key]}
                </span>
              </button>
            )
          })}
        </div>

        {currentTab === TABS_KEYS.ATUAL &&
          (grupos.ativas.length > 0 ? (
            <GrupoDisciplinas
              onSelect={selecionar}
              icon={<LuBookOpen />}
              titulo={`${aluno.semestreAtual}º semestre`}
              disciplinas={grupos.ativas}
            />
          ) : (
            <EstadoVazio
              icon={<LuCirclePlay />}
              titulo="Nenhuma disciplina em andamento"
              descricao="Encerre o semestre para registrar os resultados e escolher as disciplinas do próximo."
              acao={
                <button
                  type="button"
                  onClick={() => setOpenModal(true)}
                  className="cursor-pointer rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                >
                  Encerrar semestre
                </button>
              }
            />
          ))}

        {currentTab === TABS_KEYS.PENDENTES && (
          <>
            {pendentesObrigatorias.length > 0 && (
              <GrupoDisciplinas
                onSelect={selecionar}
                icon={<LuListTodo />}
                titulo="Obrigatórias"
                disciplinas={pendentesObrigatorias}
              />
            )}
            {pendentesOptativas.length > 0 && (
              <GrupoDisciplinas
                onSelect={selecionar}
                icon={<LuSparkles />}
                titulo="Optativas"
                disciplinas={pendentesOptativas}
              />
            )}
            {grupos.pendentes.length === 0 && (
              <EstadoVazio
                icon={<LuHourglass />}
                titulo="Nenhuma disciplina pendente"
                descricao="Tudo o que está na sua grade já foi concluído ou está em andamento."
              />
            )}
          </>
        )}

        {currentTab === TABS_KEYS.CONCLUIDAS &&
          (grupos.concluidasPorPeriodo.length > 0 ? (
            // Linha do tempo: um marco por período concluído.
            <ol className="relative ml-2 space-y-4 border-l-2 border-dashed border-gray-200 pl-6 max-md:ml-1 max-md:pl-4">
              {grupos.concluidasPorPeriodo.map(([periodo, disciplinas]) => (
                <li key={periodo} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-8 -left-[33px] size-4 rounded-full bg-xor-lime ring-4 ring-gray-50 max-md:-left-[25px]"
                  />
                  <GrupoDisciplinas
                    onSelect={selecionar}
                    icon={<LuCalendarCheck />}
                    titulo={periodo}
                    disciplinas={disciplinas}
                    exibirMedia
                  />
                </li>
              ))}
            </ol>
          ) : (
            <EstadoVazio
              icon={<LuCircleCheck />}
              titulo="Nenhuma disciplina concluída ainda"
              descricao="As disciplinas aprovadas aparecem aqui, organizadas por período."
            />
          ))}
      </div>
    </div>
  )
}

export default CourseProgressionPage
