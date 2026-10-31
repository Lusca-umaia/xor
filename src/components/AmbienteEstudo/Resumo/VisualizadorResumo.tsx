'use client'

import clsx from 'clsx'
import { useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { FormatoResumo } from '@/@types/AmbienteEstudo'
import { normalizarTexto } from '@/utils/historicoAcademico'
import { classeCampo } from '../estilos'
import Markdown from '../Markdown/Markdown'
import MapaMental from './MapaMental'

const LINHA_GLOSSARIO = /^\s*[-*]\s+\*\*(.+?)\*\*\s*[:—–-]\s*(.+)$/

/** Extrai "- **Termo**: definição"; devolve null se o texto não segue o formato. */
function lerGlossario(conteudo: string) {
  const linhas = conteudo.split('\n').filter((linha) => linha.trim())
  const termos = linhas
    .map((linha) => linha.match(LINHA_GLOSSARIO))
    .filter((resultado): resultado is RegExpMatchArray => Boolean(resultado))
    .map(([, termo, definicao]) => ({ termo, definicao }))
  return termos.length && termos.length === linhas.length ? termos : null
}

function Glossario({ conteudo }: { conteudo: string }) {
  const [busca, setBusca] = useState('')
  const termos = lerGlossario(conteudo)
  if (!termos) return <Markdown conteudo={conteudo} />

  const filtrados = termos.filter(({ termo, definicao }) =>
    normalizarTexto(`${termo} ${definicao}`).includes(normalizarTexto(busca))
  )

  return (
    <div className="space-y-4">
      <div className="nao-imprimir relative max-w-sm">
        <LuSearch className="absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-gray-400" />
        <input
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder={`Buscar entre ${termos.length} termos`}
          aria-label="Buscar no glossário"
          className={clsx(classeCampo, 'mt-0 pl-9')}
        />
      </div>
      <dl className="divide-y divide-gray-100">
        {filtrados.map(({ termo, definicao }) => (
          <div
            key={termo}
            className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-4"
          >
            <dt className="font-bold text-gray-900">
              <Markdown conteudo={termo} inline />
            </dt>
            <dd className="text-sm text-gray-700">
              <Markdown conteudo={definicao} />
            </dd>
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="py-3 text-sm text-gray-500">Nenhum termo encontrado.</p>
        )}
      </dl>
    </div>
  )
}

export default function VisualizadorResumo({
  formato,
  conteudo
}: {
  formato: FormatoResumo
  conteudo: string
}) {
  if (formato === 'MAPA_MENTAL') return <MapaMental codigo={conteudo} />
  if (formato === 'GLOSSARIO') return <Glossario conteudo={conteudo} />
  return <Markdown conteudo={conteudo} className="text-[15px] text-gray-800" />
}
