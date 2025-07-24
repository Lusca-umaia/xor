import { classNames } from '@/utils/auxiliars'

interface CouseBoxProps {
  nome: string
  codigo: string
  carater: 'Obrigatória' | 'Optativa'
  cargaHoraria: number
  active: boolean
}

const DisciplinaBox: React.FC<CouseBoxProps> = ({
  nome,
  carater,
  cargaHoraria,
  codigo,
  active = true
}) => {
  return (
    <div
      className={classNames(
        active ? '' : '',
        'group relative block cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:outline-none data-[focus]:border-indigo-600 data-[focus]:ring-2 data-[focus]:ring-indigo-600 sm:flex items-center sm:justify-between'
      )}
    >
      <span className="flex items-center">
        <span className="flex flex-col text-sm">
          <span className="font-medium text-gray-900">{nome}</span>
          <span className="text-gray-500">
            <span className="block sm:inline">{codigo} </span>{' '}
            <span aria-hidden="true" className="sm:mx-1 sm:inline">
              &middot;
            </span>{' '}
            <span className="block sm:inline">{carater}</span>
          </span>
        </span>
      </span>
      <span className="mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right">
        <span className="font-medium text-gray-900">{cargaHoraria}/hr</span>
      </span>
    </div>
  )
}

export default DisciplinaBox
