import CadeirasAtivas from '@/components/CadeirasAtivas/CadeirasAtivas'
import { STEP_KEYS } from '@/helpers/consts'
import { useRegisterContext } from '@/context/RegisterContext'
import { z } from 'zod'
import { useState } from 'react'
import { useRegister } from '@/hooks/mutations/useRegister'
import { getErrorMessage } from '@/services/api'
import { useRouter } from 'next/navigation'

interface CurrentSemesterProps {
  handleChangeStep: (step: keyof typeof STEP_KEYS) => void
}

const CurrentSemester: React.FC<CurrentSemesterProps> = ({
  handleChangeStep
}) => {
  const { formData, historico, montarCadastro } = useRegisterContext()
  const [error, setError] = useState<string>('')
  const [precisaConfirmarEmail, setPrecisaConfirmarEmail] = useState(false)
  const router = useRouter()

  const handleWithPreviousStep = () => {
    handleChangeStep(STEP_KEYS['COURSE_INFORMATION'])
  }

  const { mutate: registrar, isPending } = useRegister()

  const submitAluno = () =>
    registrar(montarCadastro(), {
      onSuccess: ({ precisaConfirmarEmail }) => {
        if (precisaConfirmarEmail) {
          setPrecisaConfirmarEmail(true)
          return
        }
        router.replace('/home')
        router.refresh()
      },
      onError: (err) => {
        setError(getErrorMessage(err, 'Não foi possível concluir o cadastro'))
      }
    })

  if (precisaConfirmarEmail) {
    return (
      <div className="space-y-4 py-6 text-center">
        <p className="text-base font-semibold">Cadastro realizado!</p>
        <p className="text-sm text-gray-600">
          Enviamos um link de confirmação para{' '}
          <span className="font-semibold">{formData.email}</span>. Confirme o
          email e depois faça login.
        </p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="cursor-pointer rounded-md bg-xor-navy px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-xor-navy/90"
        >
          Ir para o login
        </button>
      </div>
    )
  }

  const handleSubmit = () => {
    const schema = z
      .array(z.string())
      .min(
        historico ? 0 : 1,
        'Você deve ter pelo menos uma disciplina em andamento'
      )

    const result = schema.safeParse(
      formData.disciplinasManuais
        .filter(({ emAndamento }) => emAndamento)
        .map(({ codigo }) => codigo)
    )

    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    setError('')
    submitAluno()
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
          className="cursor-pointer rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Voltar
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isPending}
          className="cursor-pointer disabled:opacity-70 rounded-md bg-xor-navy px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-xor-navy/90"
        >
          {isPending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </>
  )
}

export default CurrentSemester
