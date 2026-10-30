'use client'

import clsx from 'clsx'
import { useState } from 'react'
import {
  LuCircleCheck,
  LuCircleMinus,
  LuCircleX,
  LuClock,
  LuLoader
} from 'react-icons/lu'
import { Simulado, TentativaSimulado } from '@/@types/AmbienteEstudo'
import { correcaoPendente } from '@/hooks/ambienteEstudo/useSimulados'
import { questaoCorreta } from '@/utils/ambienteEstudo/calcularResultado'
import { respostaPreenchida } from '@/utils/ambienteEstudo/corrigirQuestao'
import { formatarDuracao, formatarNota } from '@/utils/ambienteEstudo/formatar'
import { classeCartao } from '../estilos'
import FeedbackQuestao from '../Questoes/FeedbackQuestao'
import RenderizadorQuestao from '../Questoes/RenderizadorQuestao'

type Filtro = 'TODAS' | 'REVISAR'

export default function ResultadoSimulado({
  simulado,
  tentativa,
  acoes
}: {
  simulado: Simulado
  tentativa: TentativaSimulado
  acoes: React.ReactNode
}) {
  const [filtro, setFiltro] = useState<Filtro>('REVISAR')
  const resultado = tentativa.resultado
  if (!resultado) return null

  const { questoes } = simulado
  const pendente = correcaoPendente(resultado)
  const correcoes = resultado.correcoesDiscursivas
  const fim = tentativa.entregueEm ?? tentativa.iniciadaEm
  const duracao =
    (new Date(fim).getTime() - new Date(tentativa.iniciadaEm).getTime()) / 1000
  const emBranco = questoes.filter(
    (questao) => !respostaPreenchida(questao, tentativa.respostas[questao.id])
  ).length

  const situacao = (indice: number) =>
    questaoCorreta(questoes[indice], tentativa.respostas, correcoes)

  const visiveis = questoes
    .map((questao, indice) => ({ questao, indice }))
    .filter(({ indice }) => filtro === 'TODAS' || situacao(indice) !== true)

  const tempoMedio =
    Object.values(tentativa.tempoPorQuestaoSeg).reduce(
      (soma, valor) => soma + valor,
      0
    ) / Math.max(1, questoes.length)

  return (
    <div className="space-y-5">
      <section
        className={clsx(
          classeCartao,
          'grid gap-6 p-6 max-md:p-4 md:grid-cols-[auto_1fr]'
        )}
      >
        <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-900 px-8 py-6 text-white">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {pendente ? 'Nota parcial' : 'Nota'}
          </span>
          <span className="text-5xl font-bold">
            {formatarNota(resultado.notaFinal)}
          </span>
          <span className="text-xs text-gray-400">de 10</span>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">{simulado.titulo}</h2>
            <div className="mt-1 flex flex-wrap gap-2 text-xs">
              {tentativa.entregaAutomatica && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-800">
                  Entregue automaticamente (tempo esgotado)
                </span>
              )}
              {pendente && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-xor-lime/15 px-2 py-0.5 font-semibold text-xor-navy"
                  role="status"
                >
                  <LuLoader className="animate-spin" aria-hidden /> Corrigindo
                  as discursivas...
                </span>
              )}
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <li className="rounded-xl bg-gray-50 p-3">
              <span className="block text-lg font-bold">
                {resultado.acertos}/{resultado.totalObjetivas}
              </span>
              <span className="text-xs text-gray-500">objetivas certas</span>
            </li>
            {resultado.notaMaximaDiscursivas !== null && (
              <li className="rounded-xl bg-gray-50 p-3">
                <span className="block text-lg font-bold">
                  {formatarNota(resultado.notaDiscursivas ?? 0)}/
                  {formatarNota(resultado.notaMaximaDiscursivas)}
                </span>
                <span className="text-xs text-gray-500">nas discursivas</span>
              </li>
            )}
            <li className="rounded-xl bg-gray-50 p-3">
              <span className="block text-lg font-bold">
                {formatarDuracao(duracao)}
              </span>
              <span className="text-xs text-gray-500">tempo total</span>
            </li>
            <li className="rounded-xl bg-gray-50 p-3">
              <span className="block text-lg font-bold">
                {formatarDuracao(tempoMedio)}
              </span>
              <span className="text-xs text-gray-500">média por questão</span>
            </li>
            {emBranco > 0 && (
              <li className="rounded-xl bg-gray-50 p-3">
                <span className="block text-lg font-bold">{emBranco}</span>
                <span className="text-xs text-gray-500">em branco</span>
              </li>
            )}
          </ul>
          <div className="flex flex-wrap gap-2">{acoes}</div>
        </div>
      </section>

      {resultado.porTopico.length > 0 && (
        <section className={clsx(classeCartao, 'p-5')}>
          <h2 className="font-bold">Desempenho por tópico</h2>
          <p className="text-xs text-gray-500">
            Do mais fraco para o mais forte.
          </p>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {resultado.porTopico.map(({ topico, acertos, total }) => (
              <li key={topico}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{topico}</span>
                  <span className="text-gray-500">
                    {acertos}/{total} ({Math.round((acertos / total) * 100)}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-900"
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

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Revisão das questões</h2>
          <div
            className="inline-flex rounded-lg bg-gray-100 p-0.5"
            role="tablist"
          >
            {(
              [
                ['REVISAR', 'Erros e em branco'],
                ['TODAS', 'Todas']
              ] as const
            ).map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={filtro === valor}
                onClick={() => setFiltro(valor)}
                className={clsx(
                  'rounded-md px-3 py-1 text-xs font-semibold cursor-pointer',
                  filtro === valor ? 'bg-white shadow-sm' : 'text-gray-500'
                )}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>

        {visiveis.length === 0 && (
          <p className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
            Nenhuma questão para revisar. Parabéns! 🎉
          </p>
        )}

        {visiveis.map(({ questao, indice }) => {
          const correta = situacao(indice)
          const tempo = tentativa.tempoPorQuestaoSeg[questao.id]
          return (
            <details
              key={questao.id}
              className={clsx(classeCartao, 'group p-5')}
            >
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                {correta === true && (
                  <LuCircleCheck
                    className="text-green-700"
                    aria-label="Correta"
                  />
                )}
                {correta === false && (
                  <LuCircleX className="text-red-700" aria-label="Incorreta" />
                )}
                {correta === null && (
                  <LuCircleMinus
                    className="text-gray-500"
                    aria-label="Aguardando correção"
                  />
                )}
                Questão {indice + 1}
                {questao.topico && (
                  <span className="font-normal text-gray-500">
                    · {questao.topico}
                  </span>
                )}
                {tempo !== undefined && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-normal text-gray-500">
                    <LuClock aria-hidden /> {formatarDuracao(tempo)}
                  </span>
                )}
              </summary>
              <div className="mt-4 space-y-4">
                <RenderizadorQuestao
                  questao={questao}
                  resposta={tentativa.respostas[questao.id]}
                  aoResponder={() => undefined}
                  modo="CORRIGIDA"
                />
                <FeedbackQuestao
                  questao={questao}
                  resposta={tentativa.respostas[questao.id]}
                  correcaoDiscursiva={correcoes[questao.id] ?? null}
                />
              </div>
            </details>
          )
        })}
      </section>
    </div>
  )
}
