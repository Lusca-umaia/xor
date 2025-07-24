import { BsLightningCharge } from 'react-icons/bs'
import { RiProgress2Line } from 'react-icons/ri'
import { STATUS_KEYS } from '../CourseCard/CourseCard'
import { MdOutlineDoneAll } from 'react-icons/md'

interface DisciplineCardProps {
  nome: string
  status: (typeof STATUS_KEYS)['ANDAMENTO'] | (typeof STATUS_KEYS)['CONCLUIDA']
  xp: number
}

const CARD_STATUS_INFORMATION = {
  [STATUS_KEYS.CONCLUIDA]: {
    label: 'Concluída',
    icon: <MdOutlineDoneAll className="text-xl text-muted-foreground" />
  },
  [STATUS_KEYS.ANDAMENTO]: {
    label: 'Em progresso',
    icon: <RiProgress2Line className="text-xl  text-muted-foreground" />
  }
}

const DisciplineCard: React.FC<DisciplineCardProps> = ({
  nome,
  xp,
  status
}) => {
  const { icon, label } = CARD_STATUS_INFORMATION[status]

  return (
    <div className="bg-white border border-gray-100 rounded-2xl space-y-6 shadow-md p-6">
      <span className="justify-between flex items-center gap-2">
        <h3
          title={nome}
          className="line-clamp-2 text-lg font-bold leading-none tracking-tight"
        >
          {nome}
        </h3>
        <div className="flex gap-2">
          <span className="whitespace-nowrap inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
            <BsLightningCharge className="text-xl text-muted-foreground" />
            {xp} XP
          </span>
          <span className="whitespace-nowrap inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
            {icon}
            {label}
          </span>
        </div>
      </span>
      <div className="flex gap-2">
        {status !== STATUS_KEYS.CONCLUIDA && (
          <button
            type="button"
            className="w-full rounded-xl bg-white px-3.5 py-3.5 cursor-pointer text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Concluir cadeira
          </button>
        )}
        <button
          type="button"
          className="w-full rounded-xl bg-white px-3.5 py-3.5 cursor-pointer text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Ver questões
        </button>
      </div>
    </div>
  )
}

export default DisciplineCard
