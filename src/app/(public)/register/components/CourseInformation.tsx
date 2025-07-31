import Select from '@/components/Select/Select'
import CadeirasRealizadas from '@/components/CadeirasRealizadas/CadeirasRealizadas'
import { STEP_KEYS } from '@/helpers/consts'
import { useRegisterContext } from '@/context/RegisterContext'
import FormInput from '@/components/FormInput/FormInput'
import { z } from 'zod'
import { useState } from 'react'
import { isNull } from 'lodash'
import { cursosMock } from '@/utils/mockData'

export const schemaDadosAcademicos = z.object({
  cursoId: z
    .number({ message: 'É necessário informar o curso' })
    .int()
    .positive('Selecione um curso'),
  semestreAtual: z.coerce
    .number({ message: 'É necessário informar o semestre atual' })
    .int({ message: 'Semestre deve ser um número inteiro' })
    .min(1, 'Semestre deve ser maior que 0'),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  cadeirasRealizadas: z
    .array(
      z.object({
        id: z.number().int().positive('ID da cadeira inválido'),
        nota: z.number().min(0, 'Nota mínima é 0').max(10, 'Nota máxima é 10')
      })
    )
    .optional()
})

interface CourseInformationProps {
  handleChangeStep: (step: keyof typeof STEP_KEYS) => void
}

const CourseInformation: React.FC<CourseInformationProps> = ({
  handleChangeStep
}) => {
  const { handleChangeFormData, formData } = useRegisterContext()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleWithPreviousStep = () => {
    handleChangeStep(STEP_KEYS['PERSONAL_INFORMATION'])
  }

  const handleWithNextStep = () => {
    const result = schemaDadosAcademicos.safeParse({
      cursoId: formData.cursoId,
      gradeId: formData.gradeId,
      semestreAtual: formData.semestreAtual,
      matricula: formData.matricula,
      cadeirasRealizadas: formData.cadeirasRealizadas
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = String(err.path[0])
        fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    handleChangeStep(STEP_KEYS['CURRENT_SEMESTER'])
  }

  const cursos = cursosMock!.map(({ id, nome }) => ({ id, nome }))

  return (
    <>
      <div className="grid border-b border-black/10 items-center pb-6 gap-6 grid-cols-6">
        <div className="mb-auto max-md:col-span-6 col-span-2">
          <Select
            label="Curso"
            options={cursos}
            onChange={({ id }) => {
              handleChangeFormData(id, 'cursoId')
              handleChangeFormData(null, 'gradeId')
            }}
            value={formData.cursoId}
            error={errors.cursoId}
          />
        </div>
        <div className="mb-auto max-md:col-span-6 col-span-2">
          <FormInput
            type="number"
            min={1}
            label="Semestre atual"
            handleChange={(value) =>
              handleChangeFormData(value, 'semestreAtual')
            }
            value={formData['semestreAtual']?.toString()}
            name="semestreAtual"
            error={errors.semestreAtual}
            placeholder="Ex: 3"
          />
        </div>
        <div className="mb-auto max-md:col-span-6 col-span-2">
          <FormInput
            type="text"
            label="Matrícula"
            handleChange={(value) => handleChangeFormData(value, 'matricula')}
            value={formData['matricula']}
            name="matricula"
            error={errors.matricula}
            placeholder="Ex: 2020123456"
          />
        </div>
        <div className="col-span-6">
          <CadeirasRealizadas />
          {errors['cadeirasRealizadas'] && (
            <p className="text-sm font-medium mt-2 text-red-600">
              {errors['cadeirasRealizadas']}
            </p>
          )}
        </div>
      </div>
      <div className="ml-auto w-fit flex mt-6 gap-2">
        <button
          type="button"
          onClick={handleWithPreviousStep}
          className="cursor-pointer rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700/95"
        >
          Voltar
        </button>
        <button
          type="submit"
          onClick={handleWithNextStep}
          className="cursor-pointer rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Continuar
        </button>
      </div>
    </>
  )
}

export default CourseInformation
