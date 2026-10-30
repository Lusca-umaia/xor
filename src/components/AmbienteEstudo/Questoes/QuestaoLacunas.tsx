'use client'

import clsx from 'clsx'
import { Fragment } from 'react'
import { QuestaoLacunas as TipoQuestao } from '@/@types/AmbienteEstudo'
import { corrigirQuestao } from '@/utils/ambienteEstudo/corrigirQuestao'
import Markdown from '../Markdown/Markdown'
import { PropsQuestao } from './tipos'

const MARCADOR = /\{\{(\w+)\}\}/g

export default function QuestaoLacunas({
  questao,
  resposta,
  aoResponder,
  modo
}: PropsQuestao<TipoQuestao>) {
  const valores = resposta?.tipo === 'LACUNAS' ? resposta.valores : {}
  const corrigida = modo === 'CORRIGIDA'
  const correcao = corrigida ? corrigirQuestao(questao, resposta) : null

  // split com grupo de captura alterna texto e id da lacuna: [texto, id, texto, id, texto]
  const partes = questao.texto.split(MARCADOR)

  const alterar = (id: string, valor: string) =>
    aoResponder({ tipo: 'LACUNAS', valores: { ...valores, [id]: valor } })

  return (
    <div className="space-y-3">
      <p className="text-base leading-[2.6]">
        {partes.map((parte, indice) => {
          if (indice % 2 === 0) {
            return parte ? (
              <Markdown key={indice} conteudo={parte} inline />
            ) : null
          }
          const lacuna = questao.lacunas.find(({ id }) => id === parte)
          const numero = (indice + 1) / 2
          const acertou = correcao?.lacunas?.[parte]
          return (
            <Fragment key={indice}>
              <input
                value={valores[parte] ?? ''}
                onChange={(evento) => alterar(parte, evento.target.value)}
                disabled={modo !== 'RESPONDENDO'}
                aria-label={`Lacuna ${numero}`}
                autoComplete="off"
                spellCheck={false}
                className={clsx(
                  'mx-1 inline-block w-36 rounded-md border-b-2 bg-gray-50 px-2 py-0.5 text-center text-base font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-black max-sm:w-28',
                  !corrigida && 'border-gray-400',
                  corrigida &&
                    acertou &&
                    'border-green-600 bg-green-50 text-green-800',
                  corrigida &&
                    !acertou &&
                    'border-red-600 bg-red-50 text-red-800'
                )}
              />
              {corrigida && !acertou && lacuna && (
                <span className="mr-1 rounded bg-green-100 px-1.5 py-0.5 text-sm font-semibold text-green-800">
                  {lacuna.respostasAceitas[0]}
                </span>
              )}
            </Fragment>
          )
        })}
      </p>
      {modo === 'RESPONDENDO' && (
        <p className="text-xs text-gray-500">
          Acentos e letras maiúsculas não fazem diferença na correção.
        </p>
      )}
    </div>
  )
}
