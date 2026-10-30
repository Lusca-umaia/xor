'use client'

import clsx from 'clsx'
import { useState } from 'react'
import { FormatoResumo } from '@/@types/AmbienteEstudo'
import Botao from '../Botao/Botao'
import { classeCampo } from '../estilos'
import VisualizadorResumo from './VisualizadorResumo'

interface EditorResumoProps {
  formato: FormatoResumo
  conteudoInicial: string
  aoSalvar: (conteudo: string) => void
  aoCancelar: () => void
  salvando?: boolean
}

export default function EditorResumo({
  formato,
  conteudoInicial,
  aoSalvar,
  aoCancelar,
  salvando
}: EditorResumoProps) {
  const [conteudo, setConteudo] = useState(conteudoInicial)
  const [aba, setAba] = useState<'editar' | 'visualizar'>('editar')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div
          role="tablist"
          className="inline-flex rounded-lg bg-gray-100 p-0.5"
        >
          {(['editar', 'visualizar'] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              role="tab"
              aria-selected={aba === opcao}
              onClick={() => setAba(opcao)}
              className={clsx(
                'rounded-md px-3 py-1 text-xs font-semibold capitalize cursor-pointer',
                aba === opcao ? 'bg-white shadow-sm' : 'text-gray-500'
              )}
            >
              {opcao}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          {formato === 'MAPA_MENTAL'
            ? 'Sintaxe Mermaid (mindmap): use a indentação para criar ramos.'
            : 'Markdown e fórmulas em LaTeX ($...$) são aceitos.'}
        </p>
      </div>

      {aba === 'editar' ? (
        <textarea
          value={conteudo}
          onChange={(evento) => setConteudo(evento.target.value)}
          rows={18}
          aria-label="Conteúdo do resumo"
          className={clsx(classeCampo, 'font-mono text-[13px]')}
        />
      ) : (
        <div className="min-h-64 rounded-xl border border-gray-200 p-4">
          <VisualizadorResumo formato={formato} conteudo={conteudo} />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Botao onClick={aoCancelar}>Cancelar</Botao>
        <Botao
          variante="primario"
          carregando={salvando}
          disabled={!conteudo.trim()}
          onClick={() => aoSalvar(conteudo)}
        >
          Salvar alterações
        </Botao>
      </div>
    </div>
  )
}
