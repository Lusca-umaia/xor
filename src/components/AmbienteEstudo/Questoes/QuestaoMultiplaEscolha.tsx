'use client'

import clsx from 'clsx'
import { LuCheck, LuX } from 'react-icons/lu'
import {
  QuestaoMultiplaEscolha as TipoQuestao,
  Resposta
} from '@/@types/AmbienteEstudo'
import { numeroParaLetra } from '@/utils/auxiliars'
import Markdown from '../Markdown/Markdown'
import { PropsQuestao } from './tipos'

export default function QuestaoMultiplaEscolha({
  questao,
  resposta,
  aoResponder,
  modo
}: PropsQuestao<TipoQuestao>) {
  const escolhida =
    resposta?.tipo === 'MULTIPLA_ESCOLHA' ? resposta.opcaoId : null
  const corrigida = modo === 'CORRIGIDA'
  const desabilitada = modo !== 'RESPONDENDO'

  return (
    <fieldset className="space-y-2.5">
      <legend className="sr-only">Alternativas</legend>
      {questao.opcoes.map((opcao, indice) => {
        const correta = opcao.id === questao.opcaoCorretaId
        const marcada = escolhida === opcao.id
        const destacarCorreta = corrigida && correta
        const destacarErro = corrigida && marcada && !correta

        return (
          <label
            key={opcao.id}
            className={clsx(
              'flex items-start gap-3 rounded-xl p-3 ring-1 transition-colors',
              !desabilitada && 'cursor-pointer hover:bg-gray-50',
              !corrigida && marcada && 'bg-xor-navy/5 ring-2 ring-xor-navy',
              !corrigida && !marcada && 'ring-gray-200',
              destacarCorreta && 'bg-green-50 ring-2 ring-green-600',
              destacarErro && 'bg-red-50 ring-2 ring-red-600',
              corrigida && !correta && !marcada && 'ring-gray-200 opacity-80'
            )}
          >
            <input
              type="radio"
              name={`questao-${questao.id}`}
              value={opcao.id}
              checked={marcada}
              disabled={desabilitada}
              onChange={() =>
                aoResponder({
                  tipo: 'MULTIPLA_ESCOLHA',
                  opcaoId: opcao.id
                } as Resposta)
              }
              className="mt-1 size-4 shrink-0 accent-xor-navy"
            />
            <span className="w-5 shrink-0 font-bold">
              {numeroParaLetra(indice + 1)})
            </span>
            <span className="min-w-0 flex-1">
              <Markdown conteudo={opcao.texto} />
              {corrigida && (marcada || correta) && (
                <Markdown
                  conteudo={opcao.justificativa}
                  className="mt-1 text-xs text-gray-600"
                />
              )}
            </span>
            {destacarCorreta && (
              <LuCheck
                className="mt-1 shrink-0 text-green-700"
                aria-label="Alternativa correta"
              />
            )}
            {destacarErro && (
              <LuX
                className="mt-1 shrink-0 text-red-700"
                aria-label="Sua resposta, incorreta"
              />
            )}
          </label>
        )
      })}
    </fieldset>
  )
}
