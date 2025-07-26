'use client'

import FormInput from '@/components/FormInput/FormInput'
import { useRegisterContext } from '@/context/RegisterContext'
import { STEP_KEYS } from '@/helpers/consts'
import { InputHTMLAttributes } from 'react'
import { Register } from '@/context/RegisterContext'
interface PersonalInformationProps {
  handleChangeStep: (step: keyof typeof STEP_KEYS) => void
}

interface Field {
  nome: keyof Register['formData']
  type: InputHTMLAttributes<HTMLInputElement>['type']
  label: string
  mask?: string
}

const fields: Field[] = [
  { nome: 'nome', type: 'text', label: 'Nome completo' },
  { nome: 'email', type: 'email', label: 'Email' },
  { nome: 'senha', type: 'text', label: 'Senha' }
]

const PersonalInformation: React.FC<PersonalInformationProps> = ({
  handleChangeStep
}) => {
  const { handleChangeFormData, formData } = useRegisterContext()
  const errors: Record<string, string> = {}

  return (
    <form>
      <div className="grid border-b border-black/10 pb-6 grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        {fields.map((field) => (
          <div key={field.nome} className="sm:col-span-2">
            <FormInput
              type={field.type}
              mask={field.mask}
              handleChange={(value) => handleChangeFormData(value, field.nome)}
              label={field.label}
              value={formData[field.nome] as string}
              name="nome"
              error={errors[field.nome]}
            />
          </div>
        ))}
      </div>
      <div className="ml-auto w-fit flex mt-6 gap-2">
        <button
          onClick={() => handleChangeStep(STEP_KEYS.COURSE_INFORMATION)}
          type="button"
          className="cursor-pointer rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Continuar
        </button>
      </div>
    </form>
  )
}

export default PersonalInformation
