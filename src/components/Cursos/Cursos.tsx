'use client'

import { useRegisterContext } from '@/context/RegisterContext'
import { STATUS_KEYS } from '../CourseCard/CourseCard'
import DisciplinaBox from '../DisciplinaBox/DisciplinaBox'

interface Disciplina {
  carater: 'OBRIGATÓRIA' | 'OPTATIVA'
  cargaHoraria: number
  codigo: string
  nome: string
}

const mockDataDisciplinas: {
  id: number
  nomeCadeira: string
  semestreCadeira: number
  codigo: string
  cargaHoraria: number
  status: keyof typeof STATUS_KEYS
  nota?: number
  carater: 'OBRIGATÓRIA' | 'OPTATIVA'
}[] = [
  {
    id: 1,
    nomeCadeira: 'Cálculo I',
    cargaHoraria: 64,
    semestreCadeira: 1,
    codigo: 'SEM1-MAT001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 2,
    nomeCadeira: 'Introdução à Computação',
    cargaHoraria: 64,
    semestreCadeira: 1,
    codigo: 'SEM1-INF001',
    status: 'CONCLUIDA',
    nota: 7.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 3,
    nomeCadeira: 'Leitura e Produção de Texto',
    cargaHoraria: 64,
    semestreCadeira: 1,
    codigo: 'SEM1-LET001',
    status: 'ANDAMENTO',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 4,
    nomeCadeira: 'Fundamentos de Matemática',
    cargaHoraria: 64,
    semestreCadeira: 1,
    codigo: 'SEM1-MAT002',
    status: 'PENDENTE',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 5,
    nomeCadeira: 'Cálculo II',
    cargaHoraria: 64,
    semestreCadeira: 2,
    codigo: 'SEM2-MAT003',
    status: 'ANDAMENTO',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 6,
    nomeCadeira: 'Programação I',
    cargaHoraria: 64,
    semestreCadeira: 2,
    codigo: 'SEM2-INF002',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 7,
    nomeCadeira: 'Álgebra Linear',
    cargaHoraria: 64,
    semestreCadeira: 2,
    codigo: 'SEM2-MAT004',
    status: 'PENDENTE',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 8,
    nomeCadeira: 'Física Geral I',
    cargaHoraria: 64,
    semestreCadeira: 2,
    codigo: 'SEM2-FIS001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 9,
    nomeCadeira: 'Estrutura de Dados',
    cargaHoraria: 64,
    semestreCadeira: 3,
    codigo: 'SEM3-INF003',
    status: 'ANDAMENTO',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 10,
    nomeCadeira: 'Cálculo III',
    cargaHoraria: 64,
    semestreCadeira: 3,
    codigo: 'SEM3-MAT005',
    status: 'PENDENTE',
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 11,
    nomeCadeira: 'Física Geral II',
    cargaHoraria: 64,
    semestreCadeira: 3,
    codigo: 'SEM3-FIS002',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 12,
    nomeCadeira: 'Lógica Matemática',
    cargaHoraria: 64,
    semestreCadeira: 3,
    codigo: 'SEM3-MAT006',
    status: 'PENDENTE',
    nota: 5.6,
    carater: 'OBRIGATÓRIA'
  },
  {
    id: 13,
    nomeCadeira: 'Oficina de Robótica',
    cargaHoraria: 64,
    semestreCadeira: 0,
    codigo: 'OPT-ROB001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OPTATIVA'
  },
  {
    id: 14,
    nomeCadeira: 'Tópicos Especiais em Computação I',
    cargaHoraria: 64,
    semestreCadeira: 0,
    codigo: 'OPT-INF099',
    status: 'ANDAMENTO',
    carater: 'OPTATIVA'
  },
  {
    id: 15,
    nomeCadeira: 'Introdução à Filosofia da Ciência',
    cargaHoraria: 64,
    semestreCadeira: 0,
    codigo: 'OPT-FIL001',
    status: 'PENDENTE',
    carater: 'OPTATIVA'
  },
  {
    id: 16,
    nomeCadeira: 'Design de Interfaces',
    cargaHoraria: 64,
    semestreCadeira: 0,
    codigo: 'OPT-DES001',
    status: 'CONCLUIDA',
    nota: 5.6,
    carater: 'OPTATIVA'
  }
]

export default function Cursos() {
  const {
    handleChangeCadeiraRealizada,
    CADEIRAS_REALIZADAS,
    handleChangeNotaCadeiraRealizada
  } = useRegisterContext()

  const optativas = mockDataDisciplinas.filter(
    ({ carater }) => carater === 'OPTATIVA'
  )

  const obrigatorias = Object.groupBy(
    mockDataDisciplinas.filter(({ carater }) => carater === 'OBRIGATÓRIA'),
    ({ semestreCadeira }) => semestreCadeira
  )

  console.log('CADEIRAS_REALIZADAS')
  console.log(CADEIRAS_REALIZADAS)

  return (
    <fieldset>
      <p className="text-sm font-semibold leading-6 text-gray-900">
        Selecione as cadeiras que já realizou:
      </p>
      <div className="space-y-4 flex flex-col mt-1">
        {Object.entries(obrigatorias).map(([semestre, cadeiras]) => {
          return (
            <div key={semestre} className="space-y-4 ">
              <span className="text-xl flex items-center gap-2">
                <div className="flex gap-4 items-center">
                  <h3 className="font-bold leading-none  text-sm tracking-tight">
                    {semestre}º Semestre
                  </h3>
                </div>
              </span>
              <div className="grid grid-cols-3 gap-4">
                {cadeiras!.map((cadeira) => (
                  <DisciplinaBox
                    key={cadeira.codigo}
                    nota={CADEIRAS_REALIZADAS[cadeira.id]?.nota}
                    handleChangeNota={(value) => {
                      handleChangeNotaCadeiraRealizada(
                        cadeira.id,
                        parseFloat(value)
                      )
                    }}
                    onClick={() => handleChangeCadeiraRealizada(cadeira.id)}
                    carater={cadeira.carater}
                    status={
                      CADEIRAS_REALIZADAS[cadeira.id.toString()]
                        ? 'CONCLUIDA'
                        : 'PENDENTE'
                    }
                    cargaHoraria={cadeira.cargaHoraria}
                    codigo={cadeira.codigo}
                    nome={cadeira.nomeCadeira}
                  />
                ))}
              </div>
            </div>
          )
        })}
        <div className="space-y-4 flex flex-col mt-1">
          <div className="space-y-4 ">
            <span className="text-xl flex items-center gap-2">
              <div className="flex gap-4 items-center">
                <h3 className="font-bold leading-none  text-sm tracking-tight">
                  Optativas
                </h3>
              </div>
            </span>
            <div className="grid grid-cols-3 gap-4">
              {optativas.map((cadeira) => (
                <DisciplinaBox
                  key={cadeira.codigo}
                  handleChangeNota={(value) =>
                    handleChangeNotaCadeiraRealizada(
                      cadeira.id,
                      parseFloat(value)
                    )
                  }
                  nota={CADEIRAS_REALIZADAS[cadeira.id]?.nota}
                  onClick={() => handleChangeCadeiraRealizada(cadeira.id)}
                  carater={cadeira.carater}
                  status={
                    CADEIRAS_REALIZADAS[cadeira.id.toString()]
                      ? 'CONCLUIDA'
                      : 'PENDENTE'
                  }
                  cargaHoraria={cadeira.cargaHoraria}
                  codigo={cadeira.codigo}
                  nome={cadeira.nomeCadeira}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  )
}
