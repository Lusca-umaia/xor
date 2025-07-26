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
import { useState } from 'react'

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

interface CadastroAluno {
  nome: string
  email: string
  senha: string
  cursoId: number
  gradeId: number
  semestreAtual: number
  matricula: string
  cadeirasRealizadas: {
    id: number
    nota: number
  }[]
  cadeirasAtivas: number[]
}

interface Questoes {
  titulo: string
  cadeiraId: number
  questoes: {
    enunciado: string
    opcoes: {
      enunciado: string
      isCorreta: boolean
    }[]
  }[]
}

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

const mockDataDisciplinas: {
  nomeCadeira: string
  semestreCadeira: number
  codigo: string
  status: keyof typeof STATUS_KEYS
  nota?: number
  carater: 'OBRIGATÓRIA' | 'OPTATIVA'
}[] = [
  // 1º Semestre
  {
    nomeCadeira: 'Cálculo I',
    semestreCadeira: 1,
    codigo: 'SEM1-MAT001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    nomeCadeira: 'Introdução à Computação',
    semestreCadeira: 1,
    codigo: 'SEM1-INF001',
    status: 'CONCLUIDA',
    nota: 7.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    nomeCadeira: 'Leitura e Produção de Texto',
    semestreCadeira: 1,
    codigo: 'SEM1-LET001',
    status: 'ANDAMENTO',
    carater: 'OBRIGATÓRIA'
  },
  {
    nomeCadeira: 'Fundamentos de Matemática',
    semestreCadeira: 1,
    codigo: 'SEM1-MAT002',
    status: 'PENDENTE',
    carater: 'OBRIGATÓRIA'
  },

  // 2º Semestre
  {
    nomeCadeira: 'Cálculo II',
    semestreCadeira: 2,
    codigo: 'SEM2-MAT003',
    status: 'ANDAMENTO',
    carater: 'OBRIGATÓRIA'
  },
  {
    nomeCadeira: 'Programação I',
    semestreCadeira: 2,
    codigo: 'SEM2-INF002',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    nomeCadeira: 'Álgebra Linear',
    semestreCadeira: 2,
    codigo: 'SEM2-MAT004',
    status: 'PENDENTE',
    carater: 'OBRIGATÓRIA'
  },
  {
    nomeCadeira: 'Física Geral I',
    semestreCadeira: 2,
    codigo: 'SEM2-FIS001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },

  // 3º Semestre
  {
    nomeCadeira: 'Estrutura de Dados',
    semestreCadeira: 3,
    codigo: 'SEM3-INF003',
    status: 'ANDAMENTO',
    carater: 'OBRIGATÓRIA'
  },
  {
    nomeCadeira: 'Cálculo III',
    semestreCadeira: 3,
    codigo: 'SEM3-MAT005',
    status: 'PENDENTE',
    carater: 'OBRIGATÓRIA'
  },
  {
    nomeCadeira: 'Física Geral II',
    semestreCadeira: 3,
    codigo: 'SEM3-FIS002',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    nomeCadeira: 'Lógica Matemática',
    semestreCadeira: 3,
    codigo: 'SEM3-MAT006',
    status: 'PENDENTE',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },

  // Optativas
  {
    nomeCadeira: 'Oficina de Robótica',
    semestreCadeira: 0,
    codigo: 'OPT-ROB001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OPTATIVA'
  },
  {
    nomeCadeira: 'Tópicos Especiais em Computação I',
    semestreCadeira: 0,
    codigo: 'OPT-INF099',
    status: 'ANDAMENTO',
    carater: 'OPTATIVA'
  },
  {
    nomeCadeira: 'Introdução à Filosofia da Ciência',
    semestreCadeira: 0,
    codigo: 'OPT-FIL001',
    status: 'PENDENTE',
    carater: 'OPTATIVA'
  },
  {
    nomeCadeira: 'Design de Interfaces',
    semestreCadeira: 0,
    codigo: 'OPT-DES001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OPTATIVA'
  }
]

const CourseProgressionPage = () => {
  const [currentTab, setCurrentTab] = useState<keyof typeof TABS_KEYS>(
    TABS_KEYS.GERAL
  )

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

  return (
    <div>
      <Header
        title="Olá, Lucas, veja o seu progresso!"
        actions={{
          primaryAction: { title: 'Encerrar semestre', onClick: () => {} }
        }}
      />
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl space-y-4 shadow-md p-6">
          <span className="text-2xl flex items-center gap-2">
            <LuGraduationCap className="text-4xl" />
            <div className="space-y-0.5">
              <h3 className="font-semibold leading-none tracking-tight">
                {mockData.curso.nome} - {mockData.curso.codigo}
              </h3>
              <p className="text-base font-semibold">
                Matrícula:{' '}
                <span className="font-normal">{mockData.aluno.matricula}</span>
              </p>
            </div>
          </span>
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Progresso geral"
              value={`${progressoGeral * 100}%`}
              icon={<GoGoal className="text-3xl text-blue-600" />}
            />
            <StatCard
              title="Obrigatórias"
              value={`${mockData.stat.obrigatoriasFeitas}/${mockData.grade.quantidadeObrigatorias}`}
              icon={<LuBookCheck className="text-3xl text-green-600" />}
            />
            <StatCard
              title="Optativas"
              value={`${mockData.stat.optativasFeitas} concluída(s)`}
              icon={<IoBookOutline className="text-3xl text-indigo-600" />}
            />
            <StatCard
              title="Carga horária"
              value={`${mockData.grade.cargaHoraria}h`}
              icon={<FiClock className="text-3xl text-orange-600" />}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex justify-between gap-2">
              <p className="font-semibold">Disciplinas Obrigatórias</p>
              <p>
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
              <p className="font-semibold">Disciplinas Optativas</p>
              <p>
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
          <div className="grid grid-cols-2">
            {TABS.map(({ key, label }) => (
              <div
                onClick={() => setCurrentTab(key)}
                key={key}
                className={clsx(
                  'bg-white text-center cursor-pointer col-span-1 rounded-md text-base space-y-2 py-2 px-8',
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
        <h3 className="font-semibold text-2xl ">Disciplinas obrigatórias</h3>
        {Object.entries(obrigatorias).map(([semestre, cadeiras]) => {
          const concluídas = cadeiras!.filter(
            (c) => c.status === 'CONCLUIDA'
          ).length

          return (
            <div
              key={semestre}
              className="bg-white border border-gray-100 rounded-2xl space-y-4 shadow-lg p-6"
            >
              <span className="text-xl flex items-center gap-2">
                <div className="flex gap-4 items-center">
                  <h3 className="font-bold leading-none tracking-tight">
                    {semestre}º Semestre
                  </h3>
                  <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                    {concluídas}/{cadeiras!.length} concluídas
                  </span>
                </div>
              </span>
              <div className="grid grid-cols-4 gap-4">
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
        <h3 className="font-semibold text-2xl ">Disciplinas optativas</h3>
        {optativas.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl space-y-4 shadow-lg p-6">
            <div className="grid grid-cols-4 gap-4">
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
