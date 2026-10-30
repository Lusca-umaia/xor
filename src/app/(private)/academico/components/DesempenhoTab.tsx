'use client'
import { useMemo } from 'react'
import type {
  DisciplinaCurriculo,
  TentativaHistorico
} from '@/@types/Academico'
import {
  iraIndividual,
  evolucaoIRA,
  indexarCurriculo,
  resumoCurso,
  situacoes
} from '@/utils/academico'
import { Card, Estatistica, Explicacao, formatarNota } from './Comuns'

interface Props {
  curriculo: DisciplinaCurriculo[]
  historico: TentativaHistorico[]
}

const L = 560
const A = 200
const M = { e: 36, d: 12, t: 12, b: 28 }

const GraficoIRA: React.FC<{ pontos: ReturnType<typeof evolucaoIRA> }> = ({
  pontos
}) => {
  const x = (i: number) =>
    M.e + (pontos.length > 1 ? (i / (pontos.length - 1)) * (L - M.e - M.d) : 0)
  const y = (v: number) => M.t + (1 - v / 10) * (A - M.t - M.b)
  const linha = (chave: 'iraAcumulado' | 'iraPeriodo') =>
    pontos
      .map((p, i) =>
        p[chave] === null ? null : `${x(i)},${y(p[chave] as number)}`
      )
      .filter(Boolean)
      .join(' ')

  return (
    <svg
      viewBox={`0 0 ${L} ${A}`}
      className="w-full"
      role="img"
      aria-label="Evolução do IRA individual por período"
    >
      {[0, 5, 7, 10].map((v) => (
        <g key={v}>
          <line
            x1={M.e}
            x2={L - M.d}
            y1={y(v)}
            y2={y(v)}
            stroke={v === 7 ? '#c6de34' : '#e5e7eb'}
            strokeDasharray={v === 7 ? '4 3' : undefined}
          />
          <text
            x={M.e - 6}
            y={y(v) + 3}
            textAnchor="end"
            fontSize="10"
            fill="#9ca3af"
          >
            {v}
          </text>
        </g>
      ))}
      <polyline
        fill="none"
        stroke="#1d3446"
        strokeWidth="2.5"
        points={linha('iraAcumulado')}
      />
      <polyline
        fill="none"
        stroke="#5e6e7c"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        points={linha('iraPeriodo')}
      />
      {pontos.map((p, i) => (
        <g key={p.periodo}>
          {p.iraAcumulado !== null && (
            <circle cx={x(i)} cy={y(p.iraAcumulado)} r="4" fill="#1d3446">
              <title>{`${p.periodo}: acumulado ${formatarNota(p.iraAcumulado)} · período ${formatarNota(p.iraPeriodo)}`}</title>
            </circle>
          )}
          <text
            x={x(i)}
            y={A - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {p.periodo}
          </text>
        </g>
      ))}
    </svg>
  )
}

const DesempenhoTab: React.FC<Props> = ({ curriculo, historico }) => {
  const dados = useMemo(() => {
    const porCodigo = indexarCurriculo(curriculo)
    const sit = situacoes(curriculo, historico)
    return {
      ira: iraIndividual(historico, porCodigo),
      evolucao: evolucaoIRA(historico, porCodigo),
      resumo: resumoCurso(curriculo, sit),
      reprovacoes: historico.filter((t) => t.status === 'REPROVADA').length,
      trancamentos: historico.filter((t) => t.status === 'TRANCADA').length
    }
  }, [curriculo, historico])

  const { resumo } = dados

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Estatistica
          rotulo="IRA individual"
          valor={formatarNota(dados.ira)}
          detalhe="fórmula da UFC, calculada pelo app"
        />
        <Estatistica
          rotulo="Carga concluída"
          valor={`${resumo.cargaConcluida}h`}
          detalhe={`de ${resumo.cargaTotal}h obrigatórias`}
        />
        <Estatistica
          rotulo="Integralização"
          valor={`${resumo.percentual.toFixed(0)}%`}
          detalhe={`${resumo.disciplinasConcluidas} disciplinas`}
        />
        <Estatistica
          rotulo="Reprovações / trancamentos"
          valor={`${dados.reprovacoes} / ${dados.trancamentos}`}
          detalhe="no histórico de exemplo"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold tracking-tight">
            Evolução do IRA individual
          </h3>
          <span className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-4 bg-xor-navy" /> acumulado
            </span>
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-4 border-t border-dashed border-xor-slate" />{' '}
              por período
            </span>
          </span>
        </div>
        <GraficoIRA pontos={dados.evolucao} />
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-xor-lime"
            style={{ width: `${resumo.percentual}%` }}
          />
        </div>
        <Explicacao>
          <p>
            <strong>IRA individual</strong> = (1 − 0,5·T ÷ C) × (Σ Pᵢ·Cᵢ·Nᵢ ÷ Σ
            Pᵢ·Cᵢ). T = carga horária das disciplinas trancadas; C = carga
            horária das cursadas ou trancadas; Cᵢ e Nᵢ = carga horária e nota
            final da disciplina i; Pᵢ = menor valor entre 6 e o semestre do
            aluno em que i foi cursada. Reprovações entram a cada vez que
            constam no histórico.
          </p>
          <p>
            Fonte: Pró-Reitoria de Graduação da UFC (prograd.ufc.br, perguntas
            frequentes sobre o IRA). A fórmula está em imagem na página, e o
            fator final &quot;1.000&quot; foi lido como 1 (escala de 0 a 10, 3
            casas). Simplificações do app: todo trancamento é tratado como
            parcial (o total não afeta o IRA oficial) e não há registro de
            reprovação por falta (nota zero). Este é o IRA <em>individual</em>,
            não o IRA Geral. O valor oficial é o do seu histórico no SIGAA. A
            linha tracejada verde marca a média 7.
          </p>
          <p>
            Dados: histórico fictício de demonstração e matriz de CC 2024.1.
          </p>
        </Explicacao>
      </Card>
    </div>
  )
}

export default DesempenhoTab
