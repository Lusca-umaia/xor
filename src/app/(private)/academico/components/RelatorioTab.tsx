'use client'
import { useMemo, useState } from 'react'
import { LuPrinter, LuSparkles } from 'react-icons/lu'
import type {
  Avaliacao,
  DisciplinaCurriculo,
  TentativaHistorico
} from '@/@types/Academico'
import {
  iraIndividual,
  dependentesDiretos,
  descendentes,
  evolucaoIRA,
  indexarCurriculo,
  preverDesempenho,
  situacoes
} from '@/utils/academico'
import { Card, Explicacao, formatarNota } from './Comuns'

interface Props {
  curriculo: DisciplinaCurriculo[]
  historico: TentativaHistorico[]
  avaliacoes: Record<string, Avaliacao[]>
}

const LIMITE_DESTAQUE = 9
const LIMITE_NOTA_BAIXA = 6
const MAX_SUGESTOES = 5

const Secao: React.FC<{ titulo: string; itens: string[]; vazio: string }> = ({
  titulo,
  itens,
  vazio
}) => (
  <section className="space-y-1">
    <h4 className="font-bold">{titulo}</h4>
    {itens.length ? (
      <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-500">{vazio}</p>
    )}
  </section>
)

const RelatorioTab: React.FC<Props> = ({
  curriculo,
  historico,
  avaliacoes
}) => {
  const [gerado, setGerado] = useState(false)

  const r = useMemo(() => {
    const porCodigo = indexarCurriculo(curriculo)
    const nome = (c: string) => porCodigo.get(c)?.nome ?? c
    const sit = situacoes(curriculo, historico)
    const evolucao = evolucaoIRA(historico, porCodigo)
    const ultimo = evolucao.at(-1)
    const anterior = evolucao.at(-2)
    const noUltimo = historico.filter((t) => t.ordem === ultimo?.ordem)

    const conquistas: string[] = []
    for (const t of noUltimo) {
      if (t.status === 'APROVADA' && (t.nota ?? 0) >= LIMITE_DESTAQUE)
        conquistas.push(`Nota ${formatarNota(t.nota)} em ${nome(t.codigo)}.`)
    }
    if (
      ultimo &&
      anterior &&
      ultimo.iraAcumulado !== null &&
      anterior.iraAcumulado !== null
    ) {
      const delta = ultimo.iraAcumulado - anterior.iraAcumulado
      if (delta > 0)
        conquistas.push(
          `IRA acumulado subiu ${formatarNota(delta)} em ${ultimo.periodo}.`
        )
    }
    for (const t of historico.filter((x) => x.status === 'APROVADA')) {
      if (
        historico.some((x) => x.codigo === t.codigo && x.status === 'REPROVADA')
      )
        conquistas.push(`Aprovação em ${nome(t.codigo)} após uma reprovação.`)
    }

    const dificuldades: string[] = []
    for (const t of historico) {
      if (t.status === 'REPROVADA')
        dificuldades.push(`Reprovação em ${nome(t.codigo)} (${t.periodo}).`)
      if (t.status === 'TRANCADA')
        dificuldades.push(`Trancamento de ${nome(t.codigo)} (${t.periodo}).`)
      if (
        t.status === 'APROVADA' &&
        t.nota !== null &&
        t.nota < LIMITE_NOTA_BAIXA &&
        t.ordem === ultimo?.ordem
      )
        dificuldades.push(
          `Aprovação apertada em ${nome(t.codigo)} (${formatarNota(t.nota)}).`
        )
    }
    for (const [codigo, lista] of Object.entries(avaliacoes)) {
      const p = preverDesempenho(lista)
      if (p.risco === 'ALTO' || p.risco === 'CRITICO')
        dificuldades.push(
          `${nome(codigo)} em andamento com risco ${p.risco === 'ALTO' ? 'alto' : 'crítico'} de não passar direto.`
        )
    }
    const dep = dependentesDiretos(curriculo)
    const liberadas = curriculo
      .filter(
        (d) =>
          sit.get(d.codigo) === 'PENDENTE' &&
          d.prerequisitos.every((p) => sit.get(p) === 'CONCLUIDA')
      )
      .map((d) => ({ d, impacto: descendentes(d.codigo, dep).size }))
      .sort((a, b) => a.d.semestre - b.d.semestre || b.impacto - a.impacto)
      .slice(0, MAX_SUGESTOES)

    return {
      ultimo,
      ira: iraIndividual(historico, porCodigo),
      conquistas,
      dificuldades,
      liberadas,
      nome
    }
  }, [curriculo, historico, avaliacoes])

  const cargaSugerida = r.liberadas.reduce((s, x) => s + x.d.cargaHoraria, 0)

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold tracking-tight">
              Relatório semestral
            </h3>
            <p className="text-sm text-gray-500">
              Consolida conquistas, dificuldades e sugestões para o próximo
              período.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGerado(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm"
            >
              <LuSparkles /> Gerar relatório
            </button>
            {gerado && (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <LuPrinter /> Imprimir / PDF
              </button>
            )}
          </div>
        </div>
      </Card>

      {gerado && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Exemplo com histórico fictício · gerado por regras, sem IA
          </p>
          <p className="text-sm text-gray-700">
            Último período concluído:{' '}
            <strong>{r.ultimo?.periodo ?? '—'}</strong> · IRA do período{' '}
            <strong>{formatarNota(r.ultimo?.iraPeriodo ?? null)}</strong> · IRA
            acumulado <strong>{formatarNota(r.ira)}</strong>
          </p>
          <Secao
            titulo="Conquistas"
            itens={r.conquistas}
            vazio="Nenhuma conquista automática identificada."
          />
          <Secao
            titulo="Dificuldades"
            itens={r.dificuldades}
            vazio="Nenhuma dificuldade identificada."
          />
          <section className="space-y-1">
            <h4 className="font-bold">Sugestões de matrícula</h4>
            {r.liberadas.length ? (
              <>
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {r.liberadas.map(({ d, impacto }) => (
                    <li key={d.codigo}>
                      {d.codigo} {d.nome} ({d.cargaHoraria}h, {d.semestre}º
                      sem.)
                      {impacto > 0 && ` · libera ${impacto} disciplina(s)`}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500">
                  Total sugerido: {cargaSugerida}h.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Nenhuma disciplina obrigatória liberada pendente.
              </p>
            )}
          </section>
          <Explicacao titulo="Como este relatório foi montado">
            <p>
              Texto produzido por regras fixas sobre os dados calculados:
              destaque = nota ≥ {LIMITE_DESTAQUE}; nota baixa = &lt;{' '}
              {LIMITE_NOTA_BAIXA}; sugestões = obrigatórias pendentes com todos
              os pré-requisitos concluídos, ordenadas por semestre e por quantas
              disciplinas liberam (máx. {MAX_SUGESTOES}).
            </p>
            <p>
              Nenhuma IA foi usada. Quando a LLM local for conectada, ela poderá
              reescrever este mesmo conteúdo em linguagem natural; os números
              continuam vindo dos cálculos. As sugestões são apoio à decisão e
              não substituem a orientação acadêmica nem as regras de matrícula
              do SIGAA.
            </p>
          </Explicacao>
        </Card>
      )}
    </div>
  )
}

export default RelatorioTab
