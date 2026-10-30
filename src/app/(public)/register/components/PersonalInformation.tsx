'use client'

import FormInput from '@/components/FormInput/FormInput'
import { useRegisterContext } from '@/context/RegisterContext'
import { STEP_KEYS } from '@/helpers/consts'
import { InputHTMLAttributes, useState } from 'react'
import { Register } from '@/context/RegisterContext'
import { z } from 'zod'

interface PersonalInformationProps {
  handleChangeStep: (step: keyof typeof STEP_KEYS) => void
}

interface Field {
  nome: keyof Register['formData']
  type: InputHTMLAttributes<HTMLInputElement>['type']
  label: string
  placeholder?: string
  mask?: string
}

const fields: Field[] = [
  {
    nome: 'nome',
    type: 'text',
    label: 'Nome completo',
    placeholder: 'Ex: João da Silva'
  },
  {
    nome: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Ex: joao@email.com'
  },
  {
    nome: 'senha',
    type: 'password',
    label: 'Senha',
    placeholder: 'Mínimo 6 caracteres'
  }
]

export const schemaDadosPessoais = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
})

const PersonalInformation: React.FC<PersonalInformationProps> = ({
  handleChangeStep
}) => {
  const { handleChangeFormData, formData } = useRegisterContext()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const result = schemaDadosPessoais.safeParse({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    handleChangeStep(STEP_KEYS.COURSE_INFORMATION)
  }

  return (
    <div>
      <div className="grid border-b border-black/10 pb-6 gap-x-6 gap-y-8 grid-cols-6">
        {fields.map((field) => (
          <div key={field.nome} className="col-span-6 md:col-span-2">
            <FormInput
              type={field.type}
              mask={field.mask}
              handleChange={(value) => handleChangeFormData(value, field.nome)}
              label={field.label}
              value={formData[field.nome] as string}
              name={String(field.nome)}
              error={errors[field.nome]}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
      <div className="ml-auto w-fit flex mt-6 gap-2">
        <button
          onClick={handleSubmit}
          type="submit"
          className="cursor-pointer rounded-md bg-xor-navy px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-xor-navy/90"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

export default PersonalInformation
