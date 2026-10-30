'use client'

import clsx from 'clsx'
import { LuBookmark } from 'react-icons/lu'
import { Questao, Resposta } from '@/@types/AmbienteEstudo'
import { respostaPreenchida } from '@/utils/ambienteEstudo/corrigirQuestao'

interface NavegadorQuestoesProps {
  questoes: Questao[]
  respostas: Record<string, Resposta>
  marcadas: string[]
  indiceAtual: number
  aoIr: (indice: number) => void
}

export default function NavegadorQuestoes({
  questoes,
  respostas,
  marcadas,
  indiceAtual,
  aoIr
}: NavegadorQuestoesProps) {
  const respondidas = questoes.filter((questao) =>
    respostaPreenchida(questao, respostas[questao.id])
  ).length

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">
        {respondidas} de {questoes.length} respondidas
      </p>
      <ol className="grid grid-cols-5 gap-2">
        {questoes.map((questao, indice) => {
          const respondida = respostaPreenchida(questao, respostas[questao.id])
          const marcada = marcadas.includes(questao.id)
          const atual = indice === indiceAtual
          return (
            <li key={questao.id}>
              <button
                type="button"
                onClick={() => aoIr(indice)}
                aria-current={atual ? 'step' : undefined}
                aria-label={`Questão ${indice + 1}${respondida ? ', respondida' : ', em branco'}${marcada ? ', marcada para revisão' : ''}`}
                className={clsx(
                  'relative flex aspect-square w-full items-center justify-center rounded-lg text-sm font-bold transition-colors cursor-pointer',
                  respondida
                    ? 'bg-xor-navy text-white'
                    : 'bg-white text-gray-700 ring-1 ring-gray-300',
                  atual && 'ring-2 ring-offset-2 ring-xor-navy'
                )}
              >
                {indice + 1}
                {marcada && (
                  <LuBookmark
                    className="absolute -right-1 -top-1 rounded-full bg-amber-400 p-0.5 text-[14px] text-gray-900"
                    aria-hidden
                  />
                )}
              </button>
            </li>
          )
        })}
      </ol>
      <ul className="space-y-1 text-xs text-gray-500">
        <li className="flex items-center gap-2">
          <span className="size-3 rounded bg-xor-navy" /> Respondida
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded ring-1 ring-gray-300" /> Em branco
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-amber-400" /> Marcada para
          revisão
        </li>
      </ul>
    </div>
  )
}
