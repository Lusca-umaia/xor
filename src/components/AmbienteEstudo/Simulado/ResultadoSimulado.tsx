'use client'

import clsx from 'clsx'
import { useState } from 'react'
import {
  LuCircleCheck,
  LuCircleMinus,
  LuCircleX,
  LuClock,
  LuLoader,
  LuPencilLine,
  LuTarget,
  LuTimer
} from 'react-icons/lu'
import AnelProgresso from '@/components/AnelProgresso/AnelProgresso'
import CapaXor from '@/components/CapaXor/CapaXor'
import IconeTile from '@/components/IconeTile/IconeTile'
import Indicador from '@/components/Indicador/Indicador'
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
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
        <CapaXor className="px-6 py-7 max-md:px-4 max-md:py-5">
          <div className="space-y-2 pr-32 max-md:pr-24">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex rounded-md bg-white/10 px-2 py-0.5 font-semibold text-white/90 ring-1 ring-inset ring-white/20">
                Resultado do simulado
              </span>
              {tentativa.entregaAutomatica && (
                <span className="inline-flex rounded-md bg-red-500/90 px-2 py-0.5 font-semibold text-white">
                  Entregue automaticamente (tempo esgotado)
                </span>
              )}
              {pendente && (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-xor-lime px-2 py-0.5 font-semibold text-xor-navy"
                  role="status"
                >
                  <LuLoader className="animate-spin" aria-hidden /> Corrigindo
                  as discursivas...
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white max-md:text-lg sm:text-3xl">
              {simulado.titulo}
            </h2>
          </div>
        </CapaXor>

        <div className="grid gap-6 p-6 max-md:p-4 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex items-center gap-4 lg:flex-col lg:px-4">
            <AnelProgresso
              percentual={resultado.notaFinal * 10}
              espessura={4}
              className="size-32 max-md:size-24"
            >
              <span className="text-3xl font-bold leading-none text-gray-900 max-md:text-2xl">
                {formatarNota(resultado.notaFinal)}
              </span>
              <span className="mt-1 text-[11px] font-medium text-gray-500">
                {pendente ? 'nota parcial' : 'de 10'}
              </span>
            </AnelProgresso>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1 xl:grid-cols-4">
              <Indicador
                label="Objetivas certas"
                value={`${resultado.acertos}/${resultado.totalObjetivas}`}
                icon={
                  <IconeTile>
                    <LuCircleCheck />
                  </IconeTile>
                }
              />
              {resultado.notaMaximaDiscursivas !== null && (
                <Indicador
                  label="Discursivas"
                  value={formatarNota(resultado.notaDiscursivas ?? 0)}
                  detalhe={`de ${formatarNota(resultado.notaMaximaDiscursivas)}`}
                  icon={
                    <IconeTile>
                      <LuPencilLine />
                    </IconeTile>
                  }
                />
              )}
              <Indicador
                label="Tempo total"
                value={formatarDuracao(duracao)}
                icon={
                  <IconeTile>
                    <LuClock />
                  </IconeTile>
                }
              />
              <Indicador
                label="Média por questão"
                value={formatarDuracao(tempoMedio)}
                detalhe={emBranco > 0 ? `${emBranco} em branco` : undefined}
                icon={
                  <IconeTile>
                    <LuTimer />
                  </IconeTile>
                }
              />
            </div>
            <div className="flex flex-wrap gap-2">{acoes}</div>
          </div>
        </div>
      </section>

      {resultado.porTopico.length > 0 && (
        <section className={clsx(classeCartao, 'space-y-4 p-6 max-md:p-4')}>
          <header className="flex items-center gap-3">
            <IconeTile>
              <LuTarget />
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
          <ul className="grid gap-3 md:grid-cols-2">
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
