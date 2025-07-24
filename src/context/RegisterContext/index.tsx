'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState
} from 'react'

type Option = {
  id: number
  nome: string
}

export interface Register {
  formData: {
    email: string
    cpf: string
    senha: string
    nome: string
    curso: Option | null
    grade: Option | null
    semestreAtual: string
    matricula: string
  }
  handleChangeFormData: (
    value: string | Option,
    path: keyof Register['formData']
  ) => void
}

const initialFormData: Register['formData'] = {
  email: '',
  cpf: '',
  matricula: '',
  semestreAtual: '',
  senha: '',
  nome: '',
  curso: null,
  grade: null
}

const RegisterContext = createContext<Register | null>(null)

export const RegisterProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState(initialFormData)

  const handleChangeFormData = useCallback(
    (value: string | Option, path: keyof Register['formData']) => {
      setFormData((prevFormData) => ({ ...prevFormData, [path]: value }))
    },
    []
  )

  return (
    <RegisterContext.Provider value={{ formData, handleChangeFormData }}>
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
