import CadeirasAtivas from '@/components/CadeirasAtivas/CadeirasAtivas'
import { STEP_KEYS } from '@/helpers/consts'
import { useRegisterContext } from '@/context/RegisterContext'
import { z } from 'zod'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createAluno } from '@/services/auth/createAluno'

interface CurrentSemesterProps {
  handleChangeStep: (step: keyof typeof STEP_KEYS) => void
}

const schemaCadeirasAtivas = z.object({
  cadeirasAtivas: z
    .array(z.number().int().positive())
    .min(1, 'Você deve selecionar pelo menos uma cadeira')
})

const CurrentSemester: React.FC<CurrentSemesterProps> = ({
  handleChangeStep
}) => {
  const { formData } = useRegisterContext()
  const [error, setError] = useState<string>('')

  const handleWithPreviousStep = () => {
    handleChangeStep(STEP_KEYS['COURSE_INFORMATION'])
  }

  const { mutate: submitAluno, isPending } = useMutation({
    mutationFn: createAluno
  })

  const handleSubmit = () => {
    const result = schemaCadeirasAtivas.safeParse({
      cadeirasAtivas: formData.cadeirasAtivas
    })

    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    setError('')
    submitAluno(formData)
  }

  return (
    <>
      <div className="grid border-b border-black/10 items-center pb-6 grid-cols-1 gap-6 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <CadeirasAtivas />
          {error && (
            <p className="text-sm font-medium mt-2 text-red-600">{error}</p>
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
          onClick={handleSubmit}
          className="cursor-pointer rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          {isPending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </>
  )
}

export default CurrentSemester
