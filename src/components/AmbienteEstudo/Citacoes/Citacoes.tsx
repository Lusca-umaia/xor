'use client'

import { useState } from 'react'
import { LuQuote } from 'react-icons/lu'
import { Citacao } from '@/@types/AmbienteEstudo'
import Markdown from '../Markdown/Markdown'
import Modal from '../Modal/Modal'

const rotuloCitacao = ({ materialNome, pagina }: Citacao) =>
  pagina ? `${materialNome} · p. ${pagina}` : materialNome

export function ChipCitacao({
  citacao,
  aoAbrir
}: {
  citacao: Citacao
  aoAbrir: () => void
}) {
  return (
    <button
      type="button"
      onClick={aoAbrir}
      className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 cursor-pointer"
      title="Ver o trecho do material"
    >
      <LuQuote className="shrink-0" aria-hidden />
      <span className="truncate">{rotuloCitacao(citacao)}</span>
    </button>
  )
}

export function PainelCitacao({
  citacao,
  aoFechar
}: {
  citacao: Citacao | null
  aoFechar: () => void
}) {
  return (
    <Modal
      aberto={Boolean(citacao)}
      aoFechar={aoFechar}
      lateral
      titulo="Fonte"
      descricao={citacao ? rotuloCitacao(citacao) : undefined}
    >
      {citacao && (
        <div className="space-y-4">
          <blockquote className="rounded-xl border-l-4 border-black bg-gray-50 p-4 text-sm text-gray-800">
            <Markdown conteudo={citacao.trecho} />
          </blockquote>
          <p className="text-xs text-gray-500">
            Este é o trecho do seu material usado para gerar o conteúdo. Se ele
            não sustenta o que foi dito, use o botão de reportar.
          </p>
        </div>
      )}
    </Modal>
  )
}

/** Lista de chips de citação com o painel do trecho embutido. */
export default function Citacoes({
  citacoes,
  rotulo = 'Fontes'
}: {
  citacoes: Citacao[]
  rotulo?: string
}) {
  const [aberta, setAberta] = useState<Citacao | null>(null)
  if (citacoes.length === 0) return null

  // A mesma página de um material pode ser citada mais de uma vez.
  const unicas = citacoes.filter(
    (citacao, indice) =>
      citacoes.findIndex(
        (outra) =>
          outra.materialId === citacao.materialId &&
          outra.pagina === citacao.pagina
      ) === indice
  )

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold text-gray-500">{rotulo}:</span>
      {unicas.map((citacao) => (
        <ChipCitacao
          key={`${citacao.materialId}-${citacao.pagina}`}
          citacao={citacao}
          aoAbrir={() => setAberta(citacao)}
        />
      ))}
      <PainelCitacao citacao={aberta} aoFechar={() => setAberta(null)} />
    </div>
  )
}
