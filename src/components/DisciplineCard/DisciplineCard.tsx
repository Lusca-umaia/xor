'use client'
import Link from 'next/link'
import { useState } from 'react'
import { RiProgress2Line } from 'react-icons/ri'
import { STATUS_KEYS } from '../CourseCard/CourseCard'
import { MdOutlineDoneAll } from 'react-icons/md'
import ModalEncerrarCadeiraParcialmente from '../ModalEncerrarCadeiraParcialmente/ModalEncerrarCadeiraParcialmente'

interface DisciplineCardProps {
  nome: string
  id: number
  status: (typeof STATUS_KEYS)['ANDAMENTO'] | (typeof STATUS_KEYS)['CONCLUIDA']
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
  id,
  status
}) => {
  const { icon, label } = CARD_STATUS_INFORMATION[status]
  const [openModal, setOpenModal] = useState(false)

  const handleChangeModal = (value: boolean) => {
    setOpenModal(value)
  }

  return (
    <div className="bg-white border border-gray-100 max-md:space-y-4 rounded-2xl space-y-6 shadow-md p-6">
      <span className="justify-between max-md:flex-col flex max-md:gap-4 md:items-center gap-2">
        <h3
          title={nome}
          className="line-clamp-2 max-lg:text-base text-lg font-bold leading-none tracking-tight"
        >
          {nome}
        </h3>
        <div className="flex max-lg:flex-col justify-center gap-2">
          <span className="whitespace-nowrap inline-flex justify-center items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
            {icon}
            {label}
          </span>
        </div>
      </span>
      <div className="flex gap-2">
        {status !== STATUS_KEYS.CONCLUIDA && (
          <button
            type="button"
            onClick={() => handleChangeModal(true)}
            className="w-full rounded-xl bg-white px-3.5 py-3.5 cursor-pointer text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Concluir cadeira
          </button>
        )}
        <Link
          href={`/questoes/lista-questionario?disciplina=${id}`}
          className="w-full text-center rounded-xl bg-white px-3.5 py-3.5 cursor-pointer text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Ver questões
        </Link>
      </div>
      <ModalEncerrarCadeiraParcialmente
        disciplinaId={id}
        disciplinaNome={nome}
        open={openModal}
        onClose={handleChangeModal}
      />
    </div>
  )
}

export default DisciplineCard
