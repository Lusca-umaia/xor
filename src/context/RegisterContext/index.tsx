'use client'

import { getGrade } from '@/services/grades/getGrades'
import { useQuery } from '@tanstack/react-query'
import { Grade, Disciplina } from '@/@types/Grade'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState
} from 'react'

import { CadastroAluno } from '@/@types/aluno'
import { cursosMock } from '@/utils/mockData'

export interface Register {
  formData: CadastroAluno
  handleChangeFormData: (
    value: string | number | null,
    path: keyof Register['formData']
  ) => void
  handleChangeNotaCadeiraRealizada: (
    cadeiraId: number,
    notaAtualizada: number
  ) => void
  CADEIRAS_REALIZADAS: Record<
    string,
    {
      id: number
      nota: number | null
    }
  >
  CADEIRAS_ATIVAS: Record<string, number>
  handleChangeCadeiraAtiva: (cadeiraId: number) => void
  handleChangeCadeiraRealizada: (cadeiraId: number) => void
  optativas: Disciplina[]
  obrigatorias: Partial<Record<number, Disciplina[]>>
  optativasInativas: Disciplina[]
  obrigatoriasInativas: Partial<Record<number, Disciplina[]>>
}

const initialFormData: Register['formData'] = {
  email: '',
  matricula: '',
  semestreAtual: null,
  senha: '',
  nome: '',
  cursoId: null,
  gradeId: null,
  cadeirasAtivas: [],
  cadeirasRealizadas: []
}

const RegisterContext = createContext<Register | null>(null)

export const RegisterProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<CadastroAluno>(initialFormData)

  const handleChangeFormData = useCallback(
    (value: string | number | null, path: keyof Register['formData']) => {
      setFormData((prevFormData) => ({ ...prevFormData, [path]: value }))
    },
    []
  )

  const disciplinas = cursosMock.find(
    ({ id }) => id === formData.cursoId
  )?.disciplinas

  const CADEIRAS_REALIZADAS = (() => {
    return formData.cadeirasRealizadas.reduce<
      Record<string, Register['formData']['cadeirasRealizadas'][number]>
    >((acc, cur) => {
      acc[cur.id.toString()] = cur
      return acc
    }, {})
  })()

  const CADEIRAS_ATIVAS = (() => {
    return formData.cadeirasAtivas.reduce<
      Record<string, Register['formData']['cadeirasAtivas'][number]>
    >((acc, cur) => {
      acc[cur.toString()] = cur
      return acc
    }, {})
  })()

  const handleAddCadeiraRealizada = useCallback((cadeiraId: number) => {
    setFormData(({ cadeirasRealizadas, ...prevFormData }) => ({
      ...prevFormData,
      cadeirasRealizadas: [...cadeirasRealizadas, { id: cadeiraId, nota: 7 }]
    }))
  }, [])

  const handleRemoveCadeiraRealizada = useCallback((cadeiraId: number) => {
    setFormData(({ cadeirasRealizadas, ...prevFormData }) => ({
      ...prevFormData,
      cadeirasRealizadas: cadeirasRealizadas.filter(
        ({ id }) => id !== cadeiraId
      )
    }))
  }, [])

  const handleAddCadeiraAtiva = useCallback((cadeiraId: number) => {
    setFormData(({ cadeirasAtivas, ...prevFormData }) => ({
      ...prevFormData,
      cadeirasAtivas: [...cadeirasAtivas, cadeiraId]
    }))
  }, [])

  const handleRemoveCadeiraAtiva = useCallback((cadeiraId: number) => {
    setFormData(({ cadeirasAtivas, ...prevFormData }) => ({
      ...prevFormData,
      cadeirasAtivas: cadeirasAtivas.filter((id) => id !== cadeiraId)
    }))
  }, [])

  const handleChangeNotaCadeiraRealizada = useCallback(
    (cadeiraId: number, notaAtualizada: number) => {
      setFormData(({ cadeirasRealizadas, ...prevFormData }) => ({
        ...prevFormData,
        cadeirasRealizadas: cadeirasRealizadas.map(({ id, nota }) => ({
          id,
          nota: (() => {
            if (id === cadeiraId) {
              if (notaAtualizada) {
                return Math.min(notaAtualizada, 10)
              }
              return null
            } else {
              return nota
            }
          })()
        }))
      }))
    },
    []
  )

  const handleChangeCadeiraRealizada = (cadeiraId: number) => {
    if (CADEIRAS_REALIZADAS[cadeiraId.toString()]) {
      return handleRemoveCadeiraRealizada(cadeiraId)
    }
    handleAddCadeiraRealizada(cadeiraId)
  }

  const handleChangeCadeiraAtiva = (cadeiraId: number) => {
    if (CADEIRAS_ATIVAS[cadeiraId.toString()]) {
      return handleRemoveCadeiraAtiva(cadeiraId)
    }
    handleAddCadeiraAtiva(cadeiraId)
  }

  const optativas =
    disciplinas?.filter(({ carater }) => carater === 'OPTATIVA') ?? []

  const obrigatorias =
    Object.groupBy(
      disciplinas?.filter(({ carater }) => carater === 'OBRIGATORIA') ?? [],
      ({ semestre }) => semestre
    ) ?? []

  const obrigatoriasInativas =
    Object.groupBy(
      disciplinas?.filter(
        ({ carater, id }) =>
          carater === 'OBRIGATORIA' && !CADEIRAS_REALIZADAS[id.toString()]
      ) ?? [],
      ({ semestre }) => semestre
    ) ?? []

  const optativasInativas = optativas.filter(
    ({ id }) => !CADEIRAS_REALIZADAS[id.toString()]
  )

  return (
    <RegisterContext.Provider
      value={{
        formData,
        handleChangeFormData,
        handleChangeNotaCadeiraRealizada,
        handleChangeCadeiraRealizada,
        CADEIRAS_REALIZADAS,
        CADEIRAS_ATIVAS,
        handleChangeCadeiraAtiva,
        obrigatorias,
        optativas,
        optativasInativas,
        obrigatoriasInativas
      }}
    >
      {children}
    </RegisterContext.Provider>
  )
}

export const useRegisterContext = () => {
  const context = useContext(RegisterContext)
  if (!context) {
    throw new Error('useRegisterContext must be used within a RegisterProvider')
  }
  return context
}
