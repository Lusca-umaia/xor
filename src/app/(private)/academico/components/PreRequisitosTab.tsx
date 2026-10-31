'use client'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import type {
  DisciplinaCurriculo,
  SituacaoCurricular
} from '@/@types/Academico'
import {
  ancestrais,
  dependentesDiretos,
  descendentes,
  gargalos,
  impactoReprovacao,
  indexarCurriculo
} from '@/utils/academico'
import { Card, Explicacao } from './Comuns'

interface Props {
  curriculo: DisciplinaCurriculo[]
  situacao: Map<string, SituacaoCurricular>
}

const LARGURA = 124
const ALTURA = 54
const FOLGA_X = 26
const FOLGA_Y = 12
const TOPO = 30
const QTD_GARGALOS = 5

const COR_SITUACAO = {
  CONCLUIDA: { fill: '#dcfce7', stroke: '#16a34a' },
  ANDAMENTO: { fill: '#dbeafe', stroke: '#2563eb' },
  LIBERADA: { fill: '#ffffff', stroke: '#c6de34' },
  BLOQUEADA: { fill: '#f3f4f6', stroke: '#d1d5db' }
} as const

// Quebra o nome em até 2 linhas de no máximo `max` caracteres (reticências no excedente).
const quebrar = (texto: string, max: number) => {
  const linhas: string[] = []
  let atual = ''
  for (const palavra of texto.split(' ')) {
    if (atual && `${atual} ${palavra}`.length > max) {
      linhas.push(atual)
      atual = palavra
    } else atual = atual ? `${atual} ${palavra}` : palavra
  }
  linhas.push(atual)
  if (linhas.length <= 2) return linhas
  const segunda = linhas.slice(1).join(' ')
  return [
    linhas[0],
    segunda.length > max ? `${segunda.slice(0, max - 1)}…` : segunda
  ]
}

const PreRequisitosTab: React.FC<Props> = ({ curriculo, situacao }) => {
  const [hover, setHover] = useState<string | null>(null)
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [simular, setSimular] = useState(false)

  const grafo = useMemo(() => {
    const porCodigo = indexarCurriculo(curriculo)
    const dependentes = dependentesDiretos(curriculo)
    const semestres = [...new Set(curriculo.map((d) => d.semestre))].sort(
      (a, b) => a - b
    )
    const pos = new Map<string, { x: number; y: number }>()
    for (const [coluna, sem] of semestres.entries()) {
      curriculo
        .filter((d) => d.semestre === sem)
        .forEach((d, linha) =>
          pos.set(d.codigo, {
            x: 16 + coluna * (LARGURA + FOLGA_X),
            y: TOPO + linha * (ALTURA + FOLGA_Y)
          })
        )
    }
    const maxLinhas = Math.max(
      ...semestres.map((s) => curriculo.filter((d) => d.semestre === s).length)
    )
    return {
      porCodigo,
      dependentes,
      semestres,
      pos,
      largura: 32 + semestres.length * (LARGURA + FOLGA_X) - FOLGA_X,
      altura: TOPO + maxLinhas * (ALTURA + FOLGA_Y),
      top: new Map(
        gargalos(curriculo, QTD_GARGALOS).map((g, i) => [g.codigo, i + 1])
      )
    }
  }, [curriculo])

  const estado = (d: DisciplinaCurriculo) => {
    const s = situacao.get(d.codigo)
    if (s === 'CONCLUIDA') return 'CONCLUIDA'
    if (s === 'ANDAMENTO') return 'ANDAMENTO'
    return d.prerequisitos.every((p) => situacao.get(p) === 'CONCLUIDA')
      ? 'LIBERADA'
      : 'BLOQUEADA'
  }

  const foco = hover ?? selecionado
  const anc = useMemo(
    () => (foco ? ancestrais(foco, grafo.porCodigo) : new Set<string>()),
    [foco, grafo]
  )
  const desc = useMemo(
    () => (foco ? descendentes(foco, grafo.dependentes) : new Set<string>()),
    [foco, grafo]
  )
  const relacionado = (c: string) =>
    !foco || c === foco || anc.has(c) || desc.has(c)

  const escolhida = selecionado ? grafo.porCodigo.get(selecionado) : undefined
  const impacto = useMemo(
    () =>
      escolhida
        ? impactoReprovacao(escolhida.codigo, curriculo, situacao)
        : null,
    [escolhida, curriculo, situacao]
  )

  const arestas = curriculo.flatMap((d) =>
    d.prerequisitos.map((p) => ({ de: p, para: d.codigo }))
  )

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold tracking-tight">
              Mapa de pré-requisitos · Ciência da Computação (currículo 2024.1)
            </h3>
            <p className="text-sm text-gray-500">
              Passe o mouse ou clique numa disciplina: em azul o que ela exige,
              em laranja o que ela libera.
            </p>
          </div>
          <ul className="flex flex-wrap gap-3 text-xs text-gray-600">
            {[
              ['Concluída', COR_SITUACAO.CONCLUIDA],
              ['Em andamento', COR_SITUACAO.ANDAMENTO],
              ['Liberada', COR_SITUACAO.LIBERADA],
              ['Bloqueada', COR_SITUACAO.BLOQUEADA]
            ].map(([nome, cor]) => (
              <li key={nome as string} className="flex items-center gap-1">
                <span
                  className="size-3 rounded border-2"
                  style={{
                    background: (cor as { fill: string }).fill,
                    borderColor: (cor as { stroke: string }).stroke
                  }}
                />
                {nome as string}
              </li>
            ))}
            <li className="flex items-center gap-1">
              <span className="flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                1
              </span>
              Gargalo
            </li>
          </ul>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <svg
            viewBox={`0 0 ${grafo.largura} ${grafo.altura}`}
            role="group"
            aria-label="Grafo de pré-requisitos"
            className="h-auto w-full min-w-[720px]"
          >
            {grafo.semestres.map((s, i) => (
              <text
                key={s}
                x={16 + i * (LARGURA + FOLGA_X) + LARGURA / 2}
                y={18}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#9ca3af"
              >
                {s}º semestre
              </text>
            ))}

            {arestas.map(({ de, para }) => {
              const a = grafo.pos.get(de)
              const b = grafo.pos.get(para)
              if (!a || !b) return null
              const x1 = a.x + LARGURA
              const y1 = a.y + ALTURA / 2
              const x2 = b.x
              const y2 = b.y + ALTURA / 2
              const curva = (x2 - x1) / 2
              const exige =
                !!foco && (para === foco || anc.has(para)) && anc.has(de)
              const libera =
                !!foco && (de === foco || desc.has(de)) && desc.has(para)
              const diretoExige = foco === para
              const diretoLibera = foco === de
              const cor =
                exige || diretoExige
                  ? '#2563eb'
                  : libera || diretoLibera
                    ? '#ea580c'
                    : '#cbd5e1'
              const ativa = cor !== '#cbd5e1'
              return (
                <path
                  key={`${de}-${para}`}
                  d={`M${x1},${y1} C${x1 + curva},${y1} ${x2 - curva},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={cor}
                  strokeWidth={ativa ? 2.5 : 1}
                  opacity={foco && !ativa ? 0.15 : 0.9}
                />
              )
            })}

            {curriculo.map((d) => {
              const p = grafo.pos.get(d.codigo)
              if (!p) return null
              const cor = COR_SITUACAO[estado(d)]
              const rank = grafo.top.get(d.codigo)
              const ativo = d.codigo === selecionado
              return (
                <g
                  key={d.codigo}
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.codigo} ${d.nome}`}
                  aria-pressed={ativo}
                  className="cursor-pointer outline-none"
                  opacity={relacionado(d.codigo) ? 1 : 0.3}
                  onMouseEnter={() => setHover(d.codigo)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(d.codigo)}
                  onBlur={() => setHover(null)}
                  onClick={() => setSelecionado(ativo ? null : d.codigo)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelecionado(ativo ? null : d.codigo)
                    }
                  }}
                >
                  <title>{`${d.codigo} · ${d.nome} · ${d.cargaHoraria}h`}</title>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={LARGURA}
                    height={ALTURA}
                    rx={8}
                    fill={cor.fill}
                    stroke={ativo ? '#1d3446' : cor.stroke}
                    strokeWidth={ativo ? 3 : 2}
                  />
                  <text
                    x={p.x + 7}
                    y={p.y + 16}
                    fontSize="11"
                    fontWeight="700"
                    fill="#374151"
                  >
                    {d.codigo}
                  </text>
                  {quebrar(d.nome, 20).map((linha, i) => (
                    <text
                      key={i}
                      x={p.x + 7}
                      y={p.y + 30 + i * 12}
                      fontSize="10.5"
                      fill="#4b5563"
                    >
                      {linha}
                    </text>
                  ))}
                  {rank && (
                    <g>
                      <circle
                        cx={p.x + LARGURA - 2}
                        cy={p.y + 2}
                        r={9}
                        fill="#ef4444"
                      />
                      <text
                        x={p.x + LARGURA - 2}
                        y={p.y + 5.5}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="#fff"
                      >
                        {rank}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <Explicacao titulo="Como ler o mapa e o que ele não considera">
          <p>
            <strong>Gargalo</strong> = disciplina com mais dependentes diretos e
            indiretos (ranking dos {QTD_GARGALOS} maiores). Atrasar uma
            disciplina assim trava mais da grade.
          </p>
          <p>
            Fonte: matriz curricular de CC (UFC), currículo 2024.1, só
            obrigatórias. Não considera co-requisitos, equivalências, optativas
            nem regras de oferta por semestre. Confira sempre o PPC e o SIGAA.
          </p>
        </Explicacao>
      </Card>

      {escolhida && impacto && (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-gray-400">
                {escolhida.codigo} · {escolhida.semestre}º semestre ·{' '}
                {escolhida.cargaHoraria}h
              </p>
              <h4 className="text-lg font-bold">{escolhida.nome}</h4>
            </div>
            <button
              type="button"
              onClick={() => setSimular((v) => !v)}
              className={clsx(
                'cursor-pointer rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset',
                simular
                  ? 'bg-black text-white ring-black'
                  : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
              )}
            >
              {simular ? 'Ocultar simulação' : 'E se eu reprovar nesta?'}
            </button>
          </div>

          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="font-semibold text-gray-700">Exige</dt>
              <dd className="text-gray-600">
                {escolhida.prerequisitos.length
                  ? escolhida.prerequisitos
                      .map((c) => `${c} ${grafo.porCodigo.get(c)?.nome ?? ''}`)
                      .join(' · ')
                  : 'Nenhum pré-requisito'}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700">
                Libera diretamente
              </dt>
              <dd className="text-gray-600">
                {(grafo.dependentes.get(escolhida.codigo) ?? []).length
                  ? (grafo.dependentes.get(escolhida.codigo) ?? [])
                      .map((c) => `${c} ${grafo.porCodigo.get(c)?.nome ?? ''}`)
                      .join(' · ')
                  : 'Nenhuma disciplina'}
              </dd>
            </div>
          </dl>

          {simular && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
              {impacto.afetadas.length === 0 ? (
                <p>
                  Reprovar aqui não bloquearia nenhuma disciplina que ainda
                  falta concluir.
                </p>
              ) : (
                <>
                  <p className="font-semibold">
                    {impacto.afetadas.length} disciplina(s) ainda não
                    concluída(s) ficariam travadas; o maior encadeamento tem{' '}
                    {impacto.cadeiaMaisLonga}.
                  </p>
                  <p className="mt-1">
                    {impacto.afetadas
                      .map((c) => `${c} ${grafo.porCodigo.get(c)?.nome ?? ''}`)
                      .join(' · ')}
                  </p>
                </>
              )}
              <p className="mt-2 text-xs">
                Indicador estrutural, não previsão de prazo de formatura: não
                considera oferta por semestre nem disciplinas em paralelo.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default PreRequisitosTab
