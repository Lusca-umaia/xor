import Select from '@/components/Select/Select'
import Cursos from '@/components/Cursos/Cursos'
import { STEP_KEYS } from '@/helpers/consts'
import { useRegisterContext } from '@/context/RegisterContext'
import FormInput from '@/components/FormInput/FormInput'

const cursos = [
  { id: 1, nome: 'Wade Cooper' },
  { id: 2, nome: 'Arlene Mccoy' },
  { id: 3, nome: 'Devon Webb' },
  { id: 4, nome: 'Tom Cook' },
  { id: 5, nome: 'Tanya Fox' },
  { id: 6, nome: 'Hellen Schmidt' },
  { id: 7, nome: 'Caroline Schultz' },
  { id: 8, nome: 'Mason Heaney' },
  { id: 9, nome: 'Claudie Smitham' },
  { id: 10, nome: 'Emil Schaefer' }
]

interface CourseInformationProps {
  handleChangeStep: (step: keyof typeof STEP_KEYS) => void
}

const CourseInformation: React.FC<CourseInformationProps> = ({
  handleChangeStep
}) => {
  const { handleChangeFormData, formData } = useRegisterContext()

  const handleWithNextStep = () => {
    handleChangeStep(STEP_KEYS['COURSE_INFORMATION'])
  }

  const handleWithPreviousStep = () => {
    handleChangeStep(STEP_KEYS['PERSONAL_INFORMATION'])
  }

  return (
    <>
      <div className="grid border-b border-black/10 items-center pb-6 grid-cols-1 gap-6 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <Select
            label="Curso"
            options={cursos}
            onChange={({ id }) => handleChangeFormData(id, 'cursoId')}
            value={formData.cursoId}
          />
        </div>
        <div className="sm:col-span-2">
          <Select
            label="Grade"
            options={cursos}
            onChange={({ id }) => handleChangeFormData(id, 'gradeId')}
            value={formData.gradeId}
          />
        </div>
        <div className="sm:col-span-1">
          <FormInput
            type="number"
            handleChange={(value) =>
              handleChangeFormData(value, 'semestreAtual')
            }
            min={1}
            label="Semestre atual"
            value={formData['semestreAtual']?.toString()}
            name="semestreAtual"
          />
        </div>
        <div className="sm:col-span-1">
          <FormInput
            type="text"
            handleChange={(value) => handleChangeFormData(value, 'matricula')}
            label="Matrícula"
            value={formData['matricula']}
            name="matricula"
          />
        </div>
        <div className="sm:col-span-6">
          <Cursos />
        </div>
      </div>
      <div className="ml-auto w-fit flex mt-6 gap-2">
        <button
          type="button"
          onClick={handleWithPreviousStep}
          className="cursor-pointer rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700/95"
        >
          Voltar
        </button>
        <button
          onClick={handleWithNextStep}
          type="submit"
          className="cursor-pointer rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Continuar
        </button>
      </div>
    </>
  )
}

export default CourseInformation
