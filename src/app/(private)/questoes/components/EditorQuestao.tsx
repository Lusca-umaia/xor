'use client'

import clsx from 'clsx'
import { useState } from 'react'
import {
  LuArrowDown,
  LuArrowUp,
  LuCheck,
  LuCopy,
  LuLightbulb,
  LuPlus,
  LuSparkles,
  LuTrash2,
  LuX
} from 'react-icons/lu'
import { numeroParaLetra } from '@/utils/auxiliars'
import CampoTexto from './CampoTexto'
import Etiqueta from './Etiqueta'
import {
  MAX_ALTERNATIVAS,
  MIN_ALTERNATIVAS,
  QuestaoRascunho,
  adicionarAlternativa,
  removerAlternativa
} from './rascunho'

interface EditorQuestaoProps {
  questao: QuestaoRascunho
  indice: number
  total: number
  // Erros desta questão, com o caminho a partir dela (ex.: "alternativas.1").
  erros: Record<string, string>
  onChange: (questao: QuestaoRascunho) => void
  onRemover: () => void
  onDuplicar: () => void
  onMover: (direcao: -1 | 1) => void
}

const botaoIcone =
  'cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-30'

const EditorQuestao: React.FC<EditorQuestaoProps> = ({
  questao,
  indice,
  total,
  erros,
  onChange,
  onRemover,
  onDuplicar,
  onMover
}) => {
  const [mostrarExplicacao, setMostrarExplicacao] = useState(
    questao.explicacao !== ''
  )

  const alterarAlternativa = (i: number, texto: string) =>
    onChange({
      ...questao,
      alternativas: questao.alternativas.map((alt, j) =>
        j === i ? { ...alt, texto } : alt
      )
    })

  const temErro = Object.keys(erros).length > 0

  return (
    <div
      id={`questao-${questao.chave}`}
      className={clsx(
        'scroll-mt-6 space-y-4 rounded-2xl border bg-white p-5 shadow-md max-md:p-4',
        temErro ? 'border-red-200' : 'border-gray-100'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
            {indice + 1}
          </span>
          {questao.geradaPorIa && (
            <Etiqueta tom="ia" icon={<LuSparkles />}>
              Sugerida pela IA
            </Etiqueta>
          )}
        </div>
        <div className="flex items-center">
          <button
            type="button"
            title="Mover para cima"
            disabled={indice === 0}
            onClick={() => onMover(-1)}
            className={botaoIcone}
          >
            <LuArrowUp />
          </button>
          <button
            type="button"
            title="Mover para baixo"
            disabled={indice === total - 1}
            onClick={() => onMover(1)}
            className={botaoIcone}
          >
            <LuArrowDown />
          </button>
          <button
            type="button"
            title="Duplicar questão"
            onClick={onDuplicar}
            className={botaoIcone}
          >
            <LuCopy />
          </button>
          <button
            type="button"
            title="Remover questão"
            onClick={onRemover}
            className={clsx(botaoIcone, 'hover:bg-red-50! hover:text-red-600!')}
          >
            <LuTrash2 />
          </button>
        </div>
      </div>

      <CampoTexto
        name={`enunciado-${questao.chave}`}
        placeholder="Enunciado da questão"
        rows={3}
        value={questao.enunciado}
        error={erros.enunciado}
        handleChange={(enunciado) => onChange({ ...questao, enunciado })}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Alternativas</p>
          <p className="text-xs text-gray-500">
            Clique na letra para marcar a correta
          </p>
        </div>

        {questao.alternativas.map((alternativa, i) => {
          const correta = questao.correta === i
          const erro = erros[`alternativas.${i}`]

          return (
            <div key={alternativa.chave}>
              <div
                className={clsx(
                  'flex items-start gap-2 rounded-xl p-1.5 ring-1 ring-inset transition',
                  correta
                    ? 'bg-emerald-50 ring-emerald-300'
                    : erro
                      ? 'ring-red-300'
                      : 'ring-gray-200 focus-within:ring-gray-400'
                )}
              >
                <button
                  type="button"
                  title={
                    correta ? 'Alternativa correta' : 'Marcar como correta'
                  }
                  onClick={() => onChange({ ...questao, correta: i })}
                  className={clsx(
                    'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sm font-bold transition',
                    correta
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {correta ? <LuCheck /> : numeroParaLetra(i + 1)}
                </button>
                <textarea
                  rows={1}
                  value={alternativa.texto}
                  aria-label={`Alternativa ${numeroParaLetra(i + 1)}`}
                  placeholder={`Alternativa ${numeroParaLetra(i + 1)}`}
                  onChange={(e) => alterarAlternativa(i, e.target.value)}
                  className="block min-h-8 flex-1 resize-none field-sizing-content bg-transparent py-1.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none"
                />
                <button
                  type="button"
                  title="Remover alternativa"
                  disabled={questao.alternativas.length <= MIN_ALTERNATIVAS}
                  onClick={() => onChange(removerAlternativa(questao, i))}
                  className={clsx(botaoIcone, 'mt-0.5')}
                >
                  <LuX />
                </button>
              </div>
              {erro && (
                <p className="mt-0.5 text-sm font-medium text-red-600">
                  {erro}
                </p>
              )}
            </div>
          )
        })}

        {(erros.correta || erros.alternativas) && (
          <p className="text-sm font-medium text-red-600">
            {erros.correta ?? erros.alternativas}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {questao.alternativas.length < MAX_ALTERNATIVAS && (
            <button
              type="button"
              onClick={() => onChange(adicionarAlternativa(questao))}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              <LuPlus /> Alternativa
            </button>
          )}
          {!mostrarExplicacao && (
            <button
              type="button"
              onClick={() => setMostrarExplicacao(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              <LuLightbulb /> Explicação da resposta
            </button>
          )}
        </div>
      </div>

      {mostrarExplicacao && (
        <div className="rounded-xl bg-amber-50/60 p-3 ring-1 ring-inset ring-amber-100">
          <div className="mb-1 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
              <LuLightbulb /> Explicação
            </p>
            <button
              type="button"
              title="Remover explicação"
              onClick={() => {
                setMostrarExplicacao(false)
                onChange({ ...questao, explicacao: '' })
              }}
              className={botaoIcone}
            >
              <LuX />
            </button>
          </div>
          <CampoTexto
            name={`explicacao-${questao.chave}`}
            placeholder="Por que a alternativa correta está certa? Aparece na correção."
            value={questao.explicacao}
            error={erros.explicacao}
            handleChange={(explicacao) => onChange({ ...questao, explicacao })}
          />
        </div>
      )}
    </div>
  )
}

export default EditorQuestao
