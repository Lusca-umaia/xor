'use client'

import clsx from 'clsx'
import { LuChartBar, LuClock, LuRotateCcw, LuTarget } from 'react-icons/lu'
import IconeTile from '@/components/IconeTile/IconeTile'
import AnelProgresso from '@/components/AnelProgresso/AnelProgresso'
import { Atividade, TentativaAtividade } from '@/@types/AmbienteEstudo'
import {
  calcularDesempenhoPorTopico,
  questaoCorreta
} from '@/utils/ambienteEstudo/calcularResultado'
import { formatarDuracao } from '@/utils/ambienteEstudo/formatar'
import Botao, { LinkBotao } from '../Botao/Botao'
import { classeCartao } from '../estilos'
import FeedbackQuestao from '../Questoes/FeedbackQuestao'
import RenderizadorQuestao from '../Questoes/RenderizadorQuestao'

interface ResultadoAtividadeProps {
  atividade: Atividade
  tentativa: TentativaAtividade
  voltarHref: string
  aoRefazer: () => void
  aoRefazerErradas: () => void
  refazendo?: boolean
  gerandoErradas?: boolean
}

export default function ResultadoAtividade({
  atividade,
  tentativa,
  voltarHref,
  aoRefazer,
  aoRefazerErradas,
  refazendo,
  gerandoErradas
}: ResultadoAtividadeProps) {
  const { questoes } = atividade
  const { respostas, correcoesDiscursivas } = tentativa
  const paraRevisar = questoes.filter(
    (questao) =>
      questaoCorreta(questao, respostas, correcoesDiscursivas) === false
  )
  const porTopico = calcularDesempenhoPorTopico(
    questoes,
    respostas,
    correcoesDiscursivas
  )
  const proporcao = tentativa.total ? tentativa.acertos / tentativa.total : 0
  const duracao = tentativa.concluidaEm
    ? (new Date(tentativa.concluidaEm).getTime() -
        new Date(tentativa.iniciadaEm).getTime()) /
      1000
    : 0

  const mensagem =
    proporcao >= 0.8
      ? 'Excelente! Você domina bem este conteúdo.'
      : proporcao >= 0.5
        ? 'Bom trabalho! Revise os pontos abaixo para fixar.'
        : 'Cada erro mostra o que estudar a seguir. Revise as explicações e tente de novo.'

  return (
    <div className="space-y-5">
      <section className={clsx(classeCartao, 'p-6 max-md:p-4')}>
        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
          <AnelProgresso
            percentual={proporcao * 100}
            espessura={4}
            className="size-32 max-md:size-24"
          >
            <span className="text-3xl font-bold leading-none text-gray-900 max-md:text-2xl">
              {tentativa.acertos}
              <span className="text-lg text-gray-400">/{tentativa.total}</span>
            </span>
            <span className="mt-1 text-[11px] font-medium text-gray-500">
              acertos
            </span>
          </AnelProgresso>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Resultado
              </p>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                {mensagem}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 max-lg:justify-center">
                <LuClock aria-hidden /> {formatarDuracao(duracao)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 max-lg:justify-center">
              {paraRevisar.length > 0 && (
                <Botao
                  variante="primario"
                  icone={<LuTarget aria-hidden />}
                  onClick={aoRefazerErradas}
                  carregando={gerandoErradas}
                >
                  Praticar só as {paraRevisar.length} para revisar
                </Botao>
              )}
              <Botao
                icone={<LuRotateCcw aria-hidden />}
                onClick={aoRefazer}
                carregando={refazendo}
              >
                Refazer tudo
              </Botao>
              <LinkBotao href={voltarHref}>Voltar às atividades</LinkBotao>
            </div>
          </div>
        </div>
      </section>

      {porTopico.length > 0 && (
        <section className={clsx(classeCartao, 'space-y-4 p-6 max-md:p-4')}>
          <header className="flex items-center gap-3">
            <IconeTile>
              <LuChartBar />
            </IconeTile>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-tight max-md:text-base">
                Desempenho por tópico
              </h2>
              <p className="text-sm text-gray-500">
                Do mais fraco para o mais forte.
              </p>
            </div>
          </header>
          <ul className="space-y-3">
            {porTopico.map(({ topico, acertos, total }) => (
              <li key={topico}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{topico}</span>
                  <span className="text-gray-500">
                    {acertos}/{total}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-xor-navy"
                    style={{
                      width: `${Math.max(3, (acertos / total) * 100)}%`
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {paraRevisar.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold">
            Questões para revisar ({paraRevisar.length})
          </h2>
          {paraRevisar.map((questao) => (
            <details key={questao.id} className={clsx(classeCartao, 'p-5')}>
              <summary className="cursor-pointer text-sm font-semibold">
                Questão {questoes.indexOf(questao) + 1}
                {questao.topico && ` · ${questao.topico}`}
              </summary>
              <div className="mt-4 space-y-4">
                <RenderizadorQuestao
                  questao={questao}
                  resposta={respostas[questao.id]}
                  aoResponder={() => undefined}
                  modo="CORRIGIDA"
                />
                <FeedbackQuestao
                  questao={questao}
                  resposta={respostas[questao.id]}
                  correcaoDiscursiva={correcoesDiscursivas[questao.id]}
                />
              </div>
            </details>
          ))}
        </section>
      )}
    </div>
  )
}
