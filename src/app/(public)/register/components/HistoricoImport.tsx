'use client'

import { DragEvent, useRef, useState } from 'react'

import { useRegisterContext } from '@/context/RegisterContext'
import { processarHistoricoPDF } from '@/utils/historicoAcademico/processarPDF'
import { FaFilePdf } from 'react-icons/fa'
import {
  LuCheck,
  LuLoaderCircle,
  LuRefreshCw,
  LuTrash2,
  LuTriangleAlert,
  LuUpload
} from 'react-icons/lu'

const Stat = ({
  label,
  value,
  hint
}: {
  label: string
  value: string
  hint?: string
}) => (
  <div className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-inset ring-gray-200">
    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
    {hint && <p className="text-[11px] font-medium text-gray-500">{hint}</p>}
  </div>
)

const HistoricoImport = () => {
  const { historico, curso, formData, importarHistorico, limparHistorico } =
    useRegisterContext()

  const inputRef = useRef<HTMLInputElement>(null)
  const [carregando, setCarregando] = useState(false)
  const [arrastando, setArrastando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const processarArquivo = async (arquivo?: File) => {
    if (!arquivo) return

    if (arquivo.type !== 'application/pdf' && !arquivo.name.endsWith('.pdf')) {
      setErro('Selecione um arquivo PDF do histórico acadêmico.')
      return
    }

    setCarregando(true)
    setErro(null)

    try {
      const resultado = await processarHistoricoPDF(arquivo)

      if (resultado.disciplinas.length === 0) {
        throw new Error(
          'Não encontramos disciplinas no arquivo. Verifique se é o histórico acadêmico do SIGAA.'
        )
      }

      importarHistorico(resultado)
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível processar o histórico.'
      )
    } finally {
      setCarregando(false)

      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setArrastando(false)
    processarArquivo(event.dataTransfer.files?.[0])
  }

  const abrirSeletor = () => inputRef.current?.click()

  const inputArquivo = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf,.pdf"
      className="hidden"
      onChange={(event) => processarArquivo(event.target.files?.[0])}
    />
  )

  if (!historico) {
    return (
      <div className="space-y-3">
        {inputArquivo}
        <div
          role="button"
          tabIndex={0}
          onClick={abrirSeletor}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') abrirSeletor()
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setArrastando(true)
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            arrastando
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 bg-gray-50/60 hover:border-indigo-400 hover:bg-indigo-50/40'
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-inset ring-gray-200">
            {carregando ? (
              <LuLoaderCircle className="animate-spin text-2xl text-indigo-600" />
            ) : (
              <LuUpload className="text-2xl text-indigo-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {carregando
                ? 'Lendo o histórico...'
                : 'Importe seu histórico acadêmico (PDF)'}
            </p>
            <p className="mt-0.5 text-xs font-medium text-gray-500">
              Arraste o arquivo do SIGAA aqui ou clique para selecionar. As
              informações do curso, matrícula, notas e cadeiras são preenchidas
              automaticamente.
            </p>
          </div>
          <span className="text-[11px] font-medium text-gray-400">
            O arquivo é processado apenas no seu navegador.
          </span>
        </div>
        {erro && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
            <LuTriangleAlert className="shrink-0" />
            {erro}
          </p>
        )}
      </div>
    )
  }

  const carga = historico.cargaHoraria.total
  const percentualIntegralizado =
    carga?.exigido && carga.integralizado !== null
      ? Math.min(Math.round((carga.integralizado / carga.exigido) * 100), 100)
      : null

  const iraIndividual = historico.dadosCurso.iraIndividual
  const iraGeral = historico.dadosCurso.iraGeral

  const semestreAtual = historico.semestreAtual
    ? `${historico.semestreAtual}${
        formData.semestreAtual ? ` (${formData.semestreAtual}º)` : ''
      }`
    : formData.semestreAtual
      ? `${formData.semestreAtual}º`
      : '—'

  return (
    <div className="space-y-3">
      {inputArquivo}
      <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm ring-1 ring-inset ring-gray-200">
              <FaFilePdf className="text-lg" />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                <LuCheck className="text-sm" />
                Histórico importado
              </p>
              <p className="truncate text-sm font-semibold text-gray-900">
                {formData.cursoNome ||
                  historico.dadosCurso.nome ||
                  curso?.nome ||
                  'Curso não identificado'}
              </p>
              <p className="text-xs font-medium text-gray-500">
                {[
                  historico.dadosAluno.nome,
                  historico.dadosAluno.matricula &&
                    `Matrícula ${historico.dadosAluno.matricula}`,
                  historico.dadosCurso.turno,
                  historico.dadosCurso.curriculo &&
                    `Currículo ${historico.dadosCurso.curriculo}`
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={abrirSeletor}
              disabled={carregando}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? (
                <LuLoaderCircle className="animate-spin text-sm" />
              ) : (
                <LuRefreshCw className="text-sm" />
              )}
              Trocar arquivo
            </button>
            <button
              type="button"
              onClick={limparHistorico}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50"
            >
              <LuTrash2 className="text-sm" />
              Remover
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Semestre atual" value={semestreAtual} />
          <Stat
            label="IRA"
            value={iraIndividual !== null ? String(iraIndividual) : '—'}
            hint={
              [
                iraGeral !== null ? `Geral ${iraGeral}` : null,
                historico.dadosCurso.anoPeriodoInicial
                  ? `Ingresso ${historico.dadosCurso.anoPeriodoInicial}`
                  : null
              ]
                .filter(Boolean)
                .join(' · ') || undefined
            }
          />
          <Stat
            label="Aprovadas"
            value={String(historico.resumo.totalAprovadas)}
            hint={`${historico.resumo.totalReprovadas} reprovada(s)`}
          />
          <Stat
            label="Em andamento"
            value={String(historico.resumo.totalEmAndamento)}
            hint={`${historico.resumo.totalPendencias} pendência(s)`}
          />
          <Stat
            label="Média das notas"
            value={
              historico.resumo.mediaNotas !== null
                ? historico.resumo.mediaNotas.toFixed(2).replace('.', ',')
                : '—'
            }
          />
          <Stat
            label="Carga horária"
            value={
              carga
                ? `${carga.integralizado ?? 0}h / ${carga.exigido ?? '—'}h`
                : '—'
            }
            hint={
              percentualIntegralizado !== null
                ? `${percentualIntegralizado}% integralizado`
                : undefined
            }
          />
        </div>

        {percentualIntegralizado !== null && (
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${percentualIntegralizado}%` }}
              />
            </div>
            <p className="text-[11px] font-medium text-gray-500">
              {historico.resumo.totalCursadas} disciplina(s) cursada(s) ·{' '}
              {historico.resumo.cargaHorariaCursada}h de carga horária
            </p>
          </div>
        )}

        {!curso && (
          <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
            <LuTriangleAlert className="mt-0.5 shrink-0 text-sm" />O curso do
            histórico ainda não está cadastrado na base, então as disciplinas
            não foram vinculadas a uma grade. As cadeiras abaixo continuam sendo
            montadas a partir do próprio histórico.
          </p>
        )}
      </div>

      {erro && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
          <LuTriangleAlert className="shrink-0" />
          {erro}
        </p>
      )}
    </div>
  )
}

export default HistoricoImport
