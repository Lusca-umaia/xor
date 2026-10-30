'use client'
import clsx from 'clsx'
import { Dispatch, SetStateAction, useState } from 'react'
import type {
  Avaliacao,
  DisciplinaCurriculo,
  RiscoDisciplina
} from '@/@types/Academico'
import {
  MEDIA_APROVACAO,
  MEDIA_FINAL_APROVACAO,
  MEDIA_MINIMA_FINAL,
  LIMITE_RISCO_ALTO,
  LIMITE_RISCO_MEDIO,
  notaFinalNecessaria,
  preverDesempenho
} from '@/utils/academico'
import { Card, Explicacao, formatarNota } from './Comuns'

interface Props {
  // Disciplinas em andamento do aluno (dados reais).
  disciplinas: DisciplinaCurriculo[]
  avaliacoes: Record<string, Avaliacao[]>
  setAvaliacoes: Dispatch<SetStateAction<Record<string, Avaliacao[]>>>
}

const ROTULO_RISCO: Record<RiscoDisciplina, { texto: string; classe: string }> =
  {
    GARANTIDO: { texto: 'Garantida', classe: 'bg-green-100 text-green-800' },
    BAIXO: { texto: 'Risco baixo', classe: 'bg-lime-100 text-lime-800' },
    MEDIO: { texto: 'Risco médio', classe: 'bg-amber-100 text-amber-800' },
    ALTO: { texto: 'Risco alto', classe: 'bg-orange-100 text-orange-800' },
    CRITICO: { texto: 'Risco crítico', classe: 'bg-red-100 text-red-800' }
  }

const numero = (v: string) =>
  v === '' ? null : Math.min(10, Math.max(0, Number(v)))

const CalculadoraTab: React.FC<Props> = ({
  disciplinas,
  avaliacoes,
  setAvaliacoes
}) => {
  const [alvo, setAlvo] = useState(MEDIA_APROVACAO)

  const atualizar = (codigo: string, i: number, parcial: Partial<Avaliacao>) =>
    setAvaliacoes((atual) => ({
      ...atual,
      [codigo]: (atual[codigo] ?? []).map((a, j) =>
        j === i ? { ...a, ...parcial } : a
      )
    }))

  const adicionar = (codigo: string) =>
    setAvaliacoes((atual) => ({
      ...atual,
      [codigo]: [
        ...(atual[codigo] ?? []),
        {
          nome: `Avaliação ${(atual[codigo]?.length ?? 0) + 1}`,
          peso: 1,
          nota: null
        }
      ]
    }))

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold tracking-tight">
              Calculadora de meta
            </h3>
            <p className="text-sm text-gray-500">
              Informe as notas já lançadas e veja quanto falta tirar nas
              próximas avaliações.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            Média alvo
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={alvo}
              onChange={(e) => setAlvo(Number(e.target.value))}
              className="w-20 rounded-md border border-gray-300 px-2 py-1"
            />
          </label>
        </div>
        <Explicacao titulo="Como é calculado?">
          <p>
            Média ponderada: Σ(nota × peso) ÷ Σ(pesos). A nota necessária nas
            avaliações restantes é (alvo × Σpesos − Σ lançado) ÷ peso restante.
          </p>
          <p>
            Regra assumida (conferir no Regulamento da Graduação da UFC): média
            ≥ {MEDIA_APROVACAO} aprova direto; entre {MEDIA_MINIMA_FINAL} e{' '}
            {MEDIA_APROVACAO} vai para a prova final, com (média + final) ÷ 2 ≥{' '}
            {MEDIA_FINAL_APROVACAO}; abaixo de {MEDIA_MINIMA_FINAL} reprova.
          </p>
          <p>
            Níveis de risco (heurística do app): médio se a nota necessária ≥{' '}
            {LIMITE_RISCO_MEDIO}, alto se ≥ {LIMITE_RISCO_ALTO} ou acima de 10,
            crítico se nem 10 nas restantes chega a {MEDIA_MINIMA_FINAL}. Isto é
            álgebra, não previsão por IA.
          </p>
        </Explicacao>
      </Card>

      {disciplinas.length === 0 && (
        <Card>
          <p className="text-sm text-gray-500">
            Você não tem disciplinas em andamento. Marque as do semestre em
            Progressão de curso para calcular a meta de cada uma.
          </p>
        </Card>
      )}

      {disciplinas.map((d) => {
        const lista = avaliacoes[d.codigo] ?? []
        const p = preverDesempenho(lista, alvo)
        const r = ROTULO_RISCO[p.risco]
        const final = p.mediaMinima < alvo && p.pesoRestante === 0
        return (
          <Card key={d.codigo}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-400">
                  {d.codigo}
                </p>
                <h4 className="font-bold">{d.nome}</h4>
              </div>
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-bold',
                  r.classe
                )}
              >
                {r.texto}
              </span>
            </div>

            <div className="space-y-2">
              {lista.map((a, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2"
                >
                  <input
                    aria-label="Nome da avaliação"
                    value={a.nome}
                    onChange={(e) =>
                      atualizar(d.codigo, i, { nome: e.target.value })
                    }
                    className="rounded-md border border-gray-200 px-2 py-1 text-sm"
                  />
                  <input
                    aria-label="Peso"
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={a.peso}
                    onChange={(e) =>
                      atualizar(d.codigo, i, {
                        peso: Math.max(0.5, Number(e.target.value))
                      })
                    }
                    className="rounded-md border border-gray-200 px-2 py-1 text-sm"
                    title="Peso"
                  />
                  <input
                    aria-label="Nota"
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    placeholder="nota"
                    value={a.nota ?? ''}
                    onChange={(e) =>
                      atualizar(d.codigo, i, { nota: numero(e.target.value) })
                    }
                    className="rounded-md border border-gray-200 px-2 py-1 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => adicionar(d.codigo)}
                className="cursor-pointer text-xs font-semibold text-xor-navy hover:underline"
              >
                + adicionar avaliação
              </button>
            </div>

            <p className="text-sm text-gray-700">
              {p.risco === 'GARANTIDO' &&
                `Já garantida: mesmo zerando o restante, a média fica em ${formatarNota(p.mediaMinima)}.`}
              {p.risco === 'CRITICO' &&
                `Mesmo com 10 em tudo que falta, a média máxima é ${formatarNota(p.mediaMaxima)}, abaixo de ${MEDIA_MINIMA_FINAL}: reprovação provável.`}
              {p.risco !== 'GARANTIDO' &&
                p.risco !== 'CRITICO' &&
                (final
                  ? `Média final ${formatarNota(p.mediaMinima)}: vai para a prova final e precisa de ${formatarNota(notaFinalNecessaria(p.mediaMinima))}.`
                  : p.necessaria !== null && p.necessaria > 10
                    ? `Não dá para atingir ${alvo} direto (máximo ${formatarNota(p.mediaMaxima)}). Pode ir à prova final se a média ficar ≥ ${MEDIA_MINIMA_FINAL}.`
                    : p.necessaria !== null &&
                      `Precisa de média ${formatarNota(Math.max(0, p.necessaria))} nas avaliações restantes (peso ${p.pesoRestante}).`)}
            </p>
          </Card>
        )
      })}
    </div>
  )
}

export default CalculadoraTab
