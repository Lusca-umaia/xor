'use client'

import clsx from 'clsx'
import { useState } from 'react'
import { LuCircleCheck, LuCircleX, LuLightbulb } from 'react-icons/lu'
import { CorrecaoDiscursiva, Questao, Resposta } from '@/@types/AmbienteEstudo'
import { useExplicarDeOutroJeito } from '@/hooks/ambienteEstudo/useAtividades'
import { corrigirQuestao } from '@/utils/ambienteEstudo/corrigirQuestao'
import Botao from '../Botao/Botao'
import BotaoReportar from '../BotaoReportar/BotaoReportar'
import Citacoes from '../Citacoes/Citacoes'
import Markdown from '../Markdown/Markdown'
import SeloIA from '../SeloIA/SeloIA'
import CorrecaoRubrica from './CorrecaoRubrica'

interface FeedbackQuestaoProps {
  questao: Questao
  resposta?: Resposta
  correcaoDiscursiva?: CorrecaoDiscursiva | null
  /** Esconde "explique de outro jeito" (ex.: revisão compacta). */
  semExplicacaoExtra?: boolean
}

function justificativa(questao: Questao) {
  switch (questao.tipo) {
    case 'MULTIPLA_ESCOLHA': {
      const correta = questao.opcoes.find(
        ({ id }) => id === questao.opcaoCorretaId
      )
      return correta?.justificativa ?? ''
    }
    case 'VERDADEIRO_FALSO':
      return `A afirmação é **${questao.resposta ? 'verdadeira' : 'falsa'}**. ${questao.justificativa}`
    case 'LACUNAS':
      return questao.justificativa
    case 'DISCURSIVA':
      return ''
  }
}

/** Feedback formativo: certo/errado, por quê, de onde veio e outra explicação. */
export default function FeedbackQuestao({
  questao,
  resposta,
  correcaoDiscursiva,
  semExplicacaoExtra = false
}: FeedbackQuestaoProps) {
  const explicar = useExplicarDeOutroJeito()
  const [explicacoes, setExplicacoes] = useState<string[]>([])

  if (questao.tipo === 'DISCURSIVA') {
    return (
      <CorrecaoRubrica
        questao={questao}
        correcao={correcaoDiscursiva ?? null}
      />
    )
  }

  const correta = corrigirQuestao(questao, resposta)?.correta ?? false
  const respondida = Boolean(resposta)

  return (
    <section
      className={clsx(
        'space-y-3 rounded-xl border p-4',
        correta
          ? 'border-green-200 bg-green-50/50'
          : 'border-red-200 bg-red-50/40'
      )}
      aria-live="polite"
    >
      <p
        className={clsx(
          'flex items-center gap-2 font-bold',
          correta ? 'text-green-800' : 'text-red-800'
        )}
      >
        {correta ? <LuCircleCheck aria-hidden /> : <LuCircleX aria-hidden />}
        {correta
          ? 'Resposta correta!'
          : respondida
            ? 'Não foi dessa vez: veja a explicação.'
            : 'Questão em branco: veja a explicação.'}
      </p>

      <Markdown
        conteudo={justificativa(questao)}
        className="text-sm text-gray-800"
      />

      {explicacoes.map((texto, indice) => (
        <div
          key={indice}
          className="rounded-lg bg-white p-3 text-sm ring-1 ring-gray-200"
        >
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-500">
            <LuLightbulb aria-hidden /> Outra forma de ver
          </p>
          <Markdown conteudo={texto} />
        </div>
      ))}

      <Citacoes citacoes={questao.citacoes} />

      <div className="flex flex-wrap items-center gap-2">
        {!semExplicacaoExtra && (
          <Botao
            tamanho="sm"
            icone={<LuLightbulb aria-hidden />}
            carregando={explicar.isPending}
            onClick={() =>
              explicar.mutate(questao.id, {
                onSuccess: (texto) =>
                  setExplicacoes((atuais) => [...atuais, texto])
              })
            }
          >
            Explique de outro jeito
          </Botao>
        )}
        <SeloIA className="ml-auto" />
        <BotaoReportar alvo={{ tipo: 'QUESTAO', id: questao.id }} />
      </div>
    </section>
  )
}
