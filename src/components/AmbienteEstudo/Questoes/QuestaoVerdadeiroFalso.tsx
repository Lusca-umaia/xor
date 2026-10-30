'use client'

import clsx from 'clsx'
import { LuCheck, LuX } from 'react-icons/lu'
import { QuestaoVerdadeiroFalso as TipoQuestao } from '@/@types/AmbienteEstudo'
import { PropsQuestao } from './tipos'

const OPCOES = [
  { valor: true, rotulo: 'Verdadeiro', tecla: 'V' },
  { valor: false, rotulo: 'Falso', tecla: 'F' }
]

export default function QuestaoVerdadeiroFalso({
  questao,
  resposta,
  aoResponder,
  modo
}: PropsQuestao<TipoQuestao>) {
  const escolhida =
    resposta?.tipo === 'VERDADEIRO_FALSO' ? resposta.valor : null
  const corrigida = modo === 'CORRIGIDA'
  const desabilitada = modo !== 'RESPONDENDO'

  return (
    <fieldset className="grid grid-cols-2 gap-3">
      <legend className="sr-only">Julgue a afirmação</legend>
      {OPCOES.map(({ valor, rotulo, tecla }) => {
        const marcada = escolhida === valor
        const correta = questao.resposta === valor
        return (
          <label
            key={rotulo}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-base font-bold ring-1 transition-colors',
              !desabilitada && 'cursor-pointer hover:bg-gray-50',
              !corrigida &&
                marcada &&
                'bg-xor-navy text-white ring-2 ring-xor-navy hover:bg-xor-navy',
              !corrigida && !marcada && 'ring-gray-200',
              corrigida &&
                correta &&
                'bg-green-50 text-green-800 ring-2 ring-green-600',
              corrigida &&
                marcada &&
                !correta &&
                'bg-red-50 text-red-800 ring-2 ring-red-600',
              corrigida && !correta && !marcada && 'ring-gray-200 opacity-70'
            )}
          >
            <input
              type="radio"
              name={`questao-${questao.id}`}
              checked={marcada}
              disabled={desabilitada}
              onChange={() => aoResponder({ tipo: 'VERDADEIRO_FALSO', valor })}
              className="sr-only"
            />
            {corrigida && correta && <LuCheck aria-hidden />}
            {corrigida && marcada && !correta && <LuX aria-hidden />}
            {rotulo}
            {!desabilitada && (
              <kbd className="hidden rounded border border-current px-1 text-[10px] font-medium opacity-60 sm:inline">
                {tecla}
              </kbd>
            )}
          </label>
        )
      })}
    </fieldset>
  )
}
