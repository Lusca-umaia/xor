import clsx from 'clsx'
import { FaFireAlt } from 'react-icons/fa'

const mockData = {
  streak: {
    quantidade: 4,
    ultimosDias: [
      {
        ativo: true
      },
      {
        ativo: true
      },
      {
        ativo: false
      },
      {
        ativo: true
      },
      {
        ativo: true
      },
      {
        ativo: true
      },
      {
        ativo: true
      }
    ]
  }
}

const Streak = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl space-y-6 shadow-md p-5">
      <span className="flex items-center justify-between font-semibold text-sm leading-none gap-4">
        <p>Sequência de estudos</p>
        <FaFireAlt className="text-xl" />
      </span>
      <div className="space-y-3">
        <p className="font-bold text-center text-4xl">
          {mockData.streak.quantidade}
        </p>
        <div className="flex justify-center gap-1">
          {mockData.streak.ultimosDias.map((dia, index) => (
            <span
              key={index}
              className={clsx('w-4 shadow-sm aspect-square rounded-full', {
                ['bg-green-400']: dia.ativo,
                ['bg-red-400']: !dia.ativo
              })}
            ></span>
          ))}
        </div>
        <p className="font-semibold text-sm text-center">Vamos lá! 🔥</p>
      </div>
    </div>
  )
}

export default Streak
