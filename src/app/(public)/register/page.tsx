'use client'
import ProgressBar from '@/components/ProgressBar/ProgressBar'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import CourseInformation from './components/CourseInformation'
import PersonalInformation from './components/PersonalInformation'
import { STEP_KEYS } from '@/helpers/consts'
import Link from 'next/link'
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md'
import CurrentSemester from './components/CurrentSemester'

const STEP_TITLES = {
  [STEP_KEYS.COURSE_INFORMATION]: 'Informações do curso',
  [STEP_KEYS.PERSONAL_INFORMATION]: 'Informações pessoais',
  [STEP_KEYS.CURRENT_SEMESTER]: 'Informações do semestre atual'
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
    ),
    [STEP_KEYS.CURRENT_SEMESTER]: (
      <CurrentSemester handleChangeStep={handleChangeStep} />
    )
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="px-4 max-w-7xl space-y-4 mx-auto mt-4 mb-8">
      <div className=" flex flex-col justify-between">
        <button
          onClick={handleBack}
          className="flex items-center cursor-pointer"
        >
          <MdOutlineKeyboardArrowLeft className="text-xl text-gray-500" />
          <span className="leading-none text-sm gap-0.5 text-gray-500 font-medium">
            Voltar
          </span>
        </button>
        <h1 className="text-2xl font-bold">Cadastro do Aluno</h1>
      </div>
      <div className="space-y-2">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <ProgressBar />
            <h2 className="text-base md:text-lg border-black/10 pb-3 my-3 border-b font-semibold">
              {STEP_TITLES[currentStep]}
            </h2>
            <form onSubmit={(e) => e.preventDefault()}>
              {STEP_COMPONENTS[currentStep]}
            </form>
          </div>
        </div>
        <div className="flex justify-center">
          <span className="text-base font-medium">
            Já possui conta?{' '}
            <Link href={'/login'} className="text-indigo-600 underline">
              Login
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Register
