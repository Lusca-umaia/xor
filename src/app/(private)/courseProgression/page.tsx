'use client'
import CourseCard, { STATUS_KEYS } from '@/components/CourseCard/CourseCard'
import Header from '@/components/Header/Header'
import StatCard from '@/components/StatCard/StatCard'
import { GoGoal } from 'react-icons/go'
import { LuGraduationCap } from 'react-icons/lu'
import { FiClock } from 'react-icons/fi'
import { LuBookCheck } from 'react-icons/lu'
import { IoBookOutline } from 'react-icons/io5'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { mockDataDisciplinas } from '@/utils/mockData'
import ModalEncerrarSemestre from '@/components/ModalEncerrarCurso/ModalEncerrarCurso'

const TABS_KEYS = {
  GERAL: 'GERAL',
  ATUAL: 'ATUAL'
} as const

const TABS = [
  {
    label: 'Visão geral',
    key: TABS_KEYS.GERAL
  },
  {
    label: 'Semestre atual',
    key: TABS_KEYS.ATUAL
  }
]

const mockData = {
  curso: {
    nome: 'Ciência da Computação',
    codigo: 'CK2314'
  },
  aluno: {
    nome: 'Lucas Maia',
    matricula: '555205'
  },
  grade: {
    quantidadeObrigatorias: 10,
    cargaOptativas: 600,
    cargaHoraria: 1200
  },
  stat: {
    obrigatoriasFeitas: 5,
    optativasFeitas: 4,
    cargaOpativasFeitas: 600,
    cargaObrigatoriasFeitas: 300
  }
}

const CourseProgressionPage = () => {
  const [currentTab, setCurrentTab] = useState<keyof typeof TABS_KEYS>(
    TABS_KEYS.GERAL
  )
  const [openModal, setOpenModal] = useState(false)

  const progressoGeral = (() => {
    const obrigatorias = mockData.stat.cargaObrigatoriasFeitas

    const optativas = Math.min(
      mockData.stat.cargaOpativasFeitas,
      mockData.grade.cargaOptativas
    )

    return (obrigatorias + optativas) / mockData.grade.cargaHoraria
  })()

  const cargaHorariaObrigatoria =
    mockData.grade.cargaHoraria - mockData.grade.cargaOptativas

  const percentualObrigatorias =
    (mockData.stat.cargaObrigatoriasFeitas / cargaHorariaObrigatoria) * 100

  const percentualOptativas =
    (mockData.stat.cargaOpativasFeitas / mockData.grade.cargaOptativas) * 100

  const optativas = mockDataDisciplinas.filter(
    ({ carater, status }) =>
      carater === 'OPTATIVA' &&
      (currentTab === TABS_KEYS.ATUAL ? status === STATUS_KEYS.ANDAMENTO : true)
  )

  const obrigatorias = Object.groupBy(
    mockDataDisciplinas.filter(
      ({ carater, status }) =>
        carater === 'OBRIGATÓRIA' &&
        (currentTab === TABS_KEYS.ATUAL
          ? status === STATUS_KEYS.ANDAMENTO
          : true)
    ),
    ({ semestreCadeira }) => semestreCadeira
  )

  const cadeirasAtivas = useMemo(
    () =>
      mockDataDisciplinas.filter(
        ({ status }) => status === STATUS_KEYS.ANDAMENTO
      ),
    []
  )

  return (
    <div>
      <Header
        title="Olá, Lucas, veja o seu progresso!"
        actions={{
          primaryAction: {
            title: 'Encerrar semestre',
            onClick: () => setOpenModal((prevValue) => !prevValue)
          }
        }}
      />
      <ModalEncerrarSemestre
        cadeirasAtivas={cadeirasAtivas}
        open={openModal}
        setOpen={setOpenModal}
      />
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 max-md:p-4 rounded-2xl space-y-4 shadow-md p-6">
          <span className="text-2xl flex items-center gap-2">
            <LuGraduationCap className="max-lg:text-2xl text-4xl" />
            <div className="space-y-0.5">
              <h3 className="font-semibold max-md:text-lg leading-none tracking-tight">
                {mockData.curso.nome} - {mockData.curso.codigo}
              </h3>
              <p className="text-base max-md:text-sm font-semibold">
                Matrícula:{' '}
                <span className="font-normal">{mockData.aluno.matricula}</span>
              </p>
            </div>
          </span>
          <div className="grid grid-cols-1  lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            <StatCard
              title="Progresso geral"
              value={`${progressoGeral * 100}%`}
              icon={
                <GoGoal className="max-lg:text-xl shrink-0 text-3xl text-blue-600" />
              }
            />
            <StatCard
              title="Obrigatórias"
              value={`${mockData.stat.obrigatoriasFeitas}/${mockData.grade.quantidadeObrigatorias}`}
              icon={
                <LuBookCheck className="max-lg:text-xl shrink-0 text-3xl text-green-600" />
              }
            />
            <StatCard
              title="Optativas"
              value={`${mockData.stat.optativasFeitas} concluída(s)`}
              icon={
                <IoBookOutline className="max-lg:text-xl shrink-0 text-3xl text-indigo-600" />
              }
            />
            <StatCard
              title="Carga horária"
              value={`${mockData.grade.cargaHoraria}h`}
              icon={
                <FiClock className="max-lg:text-xl shrink-0 text-3xl text-orange-600" />
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex justify-between gap-2">
              <p className="font-semibold max-lg:text-sm text-base">
                Disciplinas Obrigatórias
              </p>
              <p className="font-semibold max-lg:text-sm text-base">
                {`${mockData.stat.cargaObrigatoriasFeitas}/${cargaHorariaObrigatoria}h`}
              </p>
            </span>
            <div className="w-full rounded-full overflow-hidden bg-gray-200 h-2.5">
              <div
                style={{ width: `${percentualObrigatorias}%` }}
                className="bg-black h-full"
              ></div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex justify-between gap-2">
              <p className="font-semibold max-lg:text-sm text-base">
                Disciplinas Optativas
              </p>
              <p className="font-semibold max-lg:text-sm text-base">
                {`${mockData.stat.cargaOpativasFeitas}/${mockData.grade.cargaOptativas}h`}{' '}
              </p>
            </span>
            <div className="w-full rounded-full overflow-hidden bg-gray-200 h-2.5">
              <div
                style={{ width: `${percentualOptativas}%` }}
                className="bg-black h-full"
              ></div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl space-y-4 shadow-lg p-1">
          <div className="grid max-md:grid-cols-1 grid-cols-2">
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
        <h3 className="font-bold text-2xl max-md:text-lg">
          Disciplinas obrigatórias
        </h3>
        {Object.entries(obrigatorias).map(([semestre, cadeiras]) => {
          const concluídas = cadeiras!.filter(
            (c) => c.status === 'CONCLUIDA'
          ).length

          return (
            <div
              key={semestre}
              className="bg-white border max-md:p-4 border-gray-100 rounded-2xl space-y-4 shadow-lg p-6"
            >
              <span className="max-md:text-base text-xl flex items-center gap-2">
                <div className="flex gap-4 items-center">
                  <h3 className="font-bold leading-none tracking-tight">
                    {semestre}º Semestre
                  </h3>
                  <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                    {concluídas}/{cadeiras!.length} concluídas
                  </span>
                </div>
              </span>
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
                {cadeiras!.map((cadeira, index) => (
                  <CourseCard
                    key={index}
                    carater={cadeira.carater}
                    nome={cadeira.nomeCadeira}
                    codigo={cadeira.codigo}
                    status={cadeira.status}
                    nota={cadeira.nota}
                  />
                ))}
              </div>
            </div>
          )
        })}
        <h3 className="font-bold max-md:text-lg text-2xl ">
          Disciplinas optativas
        </h3>
        {optativas.length > 0 && (
          <div className="bg-white border border-gray-100 max-md:p-4 rounded-2xl space-y-4 shadow-lg p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
              {optativas.map((optativa) => (
                <CourseCard
                  key={optativa.codigo}
                  carater={optativa.carater}
                  nome={optativa.nomeCadeira}
                  codigo={optativa.codigo}
                  status={optativa.status}
                  nota={optativa.nota}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseProgressionPage
