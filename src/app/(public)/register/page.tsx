'use client'
import ProgressBar from '@/components/ProgressBar/ProgressBar'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import CourseInformation from './components/CourseInformation'
import PersonalInformation from './components/PersonalInformation'
import { STEP_KEYS } from '@/helpers/consts'
import Link from 'next/link'
import { MdKeyboardArrowLeft } from 'react-icons/md'

const STEP_TITLES = {
  [STEP_KEYS.COURSE_INFORMATION]: 'Informações do curso',
  [STEP_KEYS.PERSONAL_INFORMATION]: 'Informações pessoais'
} as const

const Register = () => {
  const searchParams = useSearchParams()
  const currentStep = searchParams.get('step') as keyof typeof STEP_KEYS
  const pathname = usePathname()
  const router = useRouter()

  const handleChangeStep = (step: keyof typeof STEP_KEYS) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step)
    router.replace(`${pathname}?${params.toString()}`)
  }

  const STEP_COMPONENTS = {
    [STEP_KEYS.COURSE_INFORMATION]: (
      <CourseInformation handleChangeStep={handleChangeStep} />
    ),
    [STEP_KEYS.PERSONAL_INFORMATION]: (
      <PersonalInformation handleChangeStep={handleChangeStep} />
    )
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="max-w-6xl space-y-4 mx-auto mt-4">
      <div className="flex flex-col justify-between">
        <button onClick={handleBack} className="cursor-pointer">
          <span className="leading-none flex text-sm gap-0.5 items-center text-gray-500 font-medium">
            <MdKeyboardArrowLeft className="text-xl -m-1" />
            Voltar
          </span>
        </button>
        <h1 className="text-2xl font-bold">Cadastro do Aluno</h1>
      </div>
      <div className="space-y-2">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <ProgressBar />
            <h2 className="text-lg border-black/10 pb-3 mb-3 border-b font-semibold">
              {STEP_TITLES[currentStep]}
            </h2>
            {STEP_COMPONENTS[currentStep]}
          </div>
        </div>
        <div className="flex justify-center">
          <span className="text-base font-medium">
            Já possui conta?{' '}
            <Link href={'/'} className="text-indigo-600 underline">
              Login
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Register
