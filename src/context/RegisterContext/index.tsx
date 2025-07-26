'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState
} from 'react'

export interface Register {
  formData: {
    nome: string
    email: string
    senha: string
    cursoId: number | null
    gradeId: number | null
    semestreAtual: number | null
    matricula: string
    cadeirasRealizadas: {
      id: number
      nota: number | null
    }[]
    cadeirasAtivas: number[]
  }
  handleChangeFormData: (
    value: string | number,
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
  handleAddCadeiraRealizada: (cadeiraId: number) => void
  handleRemoveCadeiraRealizada: (cadeiraId: number) => void
  handleChangeCadeiraRealizada: (cadeiraId: number) => void
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
  const [formData, setFormData] = useState(initialFormData)

  const handleChangeFormData = useCallback(
    (value: string | number, path: keyof Register['formData']) => {
      setFormData((prevFormData) => ({ ...prevFormData, [path]: value }))
    },
    []
  )

  //Hash map
  const CADEIRAS_REALIZADAS = (() => {
    return formData.cadeirasRealizadas.reduce<
      Record<string, Register['formData']['cadeirasRealizadas'][number]>
    >((acc, cur) => {
      acc[cur.id.toString()] = cur
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

  return (
    <RegisterContext.Provider
      value={{
        formData,
        handleChangeFormData,
        handleAddCadeiraRealizada,
        handleChangeNotaCadeiraRealizada,
        handleRemoveCadeiraRealizada,
        handleChangeCadeiraRealizada,
        CADEIRAS_REALIZADAS
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
