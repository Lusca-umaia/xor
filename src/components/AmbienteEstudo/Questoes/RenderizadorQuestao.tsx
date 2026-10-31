'use client'

import { ReactNode } from 'react'
import { Questao } from '@/@types/AmbienteEstudo'
import {
  ROTULO_DIFICULDADE,
  ROTULO_TIPO_QUESTAO
} from '@/utils/ambienteEstudo/rotulos'
import Markdown from '../Markdown/Markdown'
import QuestaoDiscursiva from './QuestaoDiscursiva'
import QuestaoLacunas from './QuestaoLacunas'
import QuestaoMultiplaEscolha from './QuestaoMultiplaEscolha'
import QuestaoVerdadeiroFalso from './QuestaoVerdadeiroFalso'
import { PropsQuestao } from './tipos'

interface RenderizadorQuestaoProps extends PropsQuestao {
  numero?: number
  /** Conteúdo extra no cabeçalho (ex.: botão de marcar para revisão). */
  acoesCabecalho?: ReactNode
}

/** Enunciado + corpo da questão de acordo com o tipo. Usado em atividades e simulados. */
export default function RenderizadorQuestao({
  numero,
  acoesCabecalho,
  ...props
}: RenderizadorQuestaoProps) {
  const { questao } = props

  return (
    <article
      className="space-y-4"
      aria-label={numero ? `Questão ${numero}` : 'Questão'}
    >
      <header className="flex flex-wrap items-center gap-2 text-xs">
        {numero !== undefined && (
          <span className="rounded-md bg-xor-navy px-2 py-0.5 font-bold text-white">
            Questão {numero}
          </span>
        )}
        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
          {ROTULO_TIPO_QUESTAO[questao.tipo]}
        </span>
        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
          {ROTULO_DIFICULDADE[questao.dificuldade]}
        </span>
        {questao.topico && (
          <span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
            {questao.topico}
          </span>
        )}
        {acoesCabecalho && <span className="ml-auto">{acoesCabecalho}</span>}
      </header>

      <Markdown
        conteudo={questao.enunciado}
        className="text-base font-medium text-gray-900"
      />

      <CorpoQuestao {...props} />
    </article>
  )
}

function CorpoQuestao(props: PropsQuestao) {
  const { questao } = props
  switch (questao.tipo) {
    case 'MULTIPLA_ESCOLHA':
      return <QuestaoMultiplaEscolha {...props} questao={questao} />
    case 'VERDADEIRO_FALSO':
      return <QuestaoVerdadeiroFalso {...props} questao={questao} />
    case 'LACUNAS':
      return <QuestaoLacunas {...props} questao={questao} />
    case 'DISCURSIVA':
      return <QuestaoDiscursiva {...props} questao={questao} />
  }
}

export type { Questao }
