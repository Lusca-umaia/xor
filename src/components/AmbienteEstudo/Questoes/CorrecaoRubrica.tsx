'use client'

import { LuLoader, LuScale } from 'react-icons/lu'
import { CorrecaoDiscursiva, QuestaoDiscursiva } from '@/@types/AmbienteEstudo'
import { formatarNota } from '@/utils/ambienteEstudo/formatar'
import BotaoReportar from '../BotaoReportar/BotaoReportar'
import Citacoes from '../Citacoes/Citacoes'
import Markdown from '../Markdown/Markdown'

interface CorrecaoRubricaProps {
  questao: QuestaoDiscursiva
  correcao: CorrecaoDiscursiva | null
}

/** Correção formativa por critério, sempre rotulada e contestável. */
export default function CorrecaoRubrica({
  questao,
  correcao
}: CorrecaoRubricaProps) {
  if (!correcao || correcao.status === 'GERANDO') {
    return (
      <div
        className="flex items-center gap-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-600"
        role="status"
      >
        <LuLoader className="animate-spin" aria-hidden />
        Corrigindo sua resposta pelos critérios da rubrica...
      </div>
    )
  }

  const proporcao = correcao.nota / correcao.notaMaxima

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Correção por rubrica
          </p>
          <p className="text-2xl font-bold">
            {formatarNota(correcao.nota)}{' '}
            <span className="text-base font-medium text-gray-500">
              / {formatarNota(correcao.notaMaxima)}
            </span>
          </p>
        </div>
        <div
          className="h-2 w-40 overflow-hidden rounded-full bg-gray-100"
          role="meter"
          aria-label="Proporção da nota"
          aria-valuenow={Math.round(proporcao * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-xor-navy"
            style={{ width: `${Math.max(3, proporcao * 100)}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-800">{correcao.feedbackGeral}</p>

      <ul className="space-y-2">
        {questao.rubrica.map((criterio) => {
          const resultado = correcao.criterios.find(
            ({ criterioId }) => criterioId === criterio.id
          )
          return (
            <li key={criterio.id} className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <Markdown
                  conteudo={criterio.descricao}
                  className="font-medium"
                />
                <span className="shrink-0 font-bold">
                  {formatarNota(resultado?.pontosObtidos ?? 0)}/
                  {criterio.pontos}
                </span>
              </div>
              {resultado && (
                <p className="mt-1 text-xs text-gray-600">
                  {resultado.justificativa}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <details className="rounded-lg border border-gray-200 p-3 text-sm">
        <summary className="cursor-pointer font-semibold">
          Ver resposta modelo
        </summary>
        <Markdown
          conteudo={questao.respostaModelo}
          className="mt-2 text-gray-700"
        />
      </details>

      <Citacoes citacoes={questao.citacoes} rotulo="Releia" />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <LuScale aria-hidden />
          Avaliação formativa gerada por IA: não substitui a avaliação do
          docente.
        </p>
        <BotaoReportar
          alvo={{ tipo: 'CORRECAO', id: questao.id }}
          texto="Contestar correção"
        />
      </div>
    </section>
  )
}
