'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LuLoader, LuSearch } from 'react-icons/lu'
import { Material } from '@/@types/AmbienteEstudo'
import { normalizarTexto } from '@/utils/historicoAcademico'
import { classeCampo } from '../estilos'
import IconeMaterial from '../IconeMaterial/IconeMaterial'

interface SeletorMateriaisProps {
  ambienteId: string
  materiais: Material[]
  selecionados: string[]
  aoMudar: (ids: string[]) => void
}

/** Escolha dos materiais usados como contexto (chat, resumo, atividade, simulado). */
export default function SeletorMateriais({
  ambienteId,
  materiais,
  selecionados,
  aoMudar
}: SeletorMateriaisProps) {
  const [busca, setBusca] = useState('')
  const disponiveis = materiais.filter(({ status }) => status !== 'ERRO')
  const prontos = disponiveis.filter(({ status }) => status === 'PRONTO')
  const filtrados = disponiveis.filter(({ nome }) =>
    normalizarTexto(nome).includes(normalizarTexto(busca))
  )

  if (disponiveis.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-600">
        Nenhum material na biblioteca ainda.{' '}
        <Link
          href={`/ambientes/${ambienteId}/materiais`}
          className="font-semibold text-gray-900 underline"
        >
          Enviar materiais
        </Link>
      </div>
    )
  }

  const alternar = (id: string) =>
    aoMudar(
      selecionados.includes(id)
        ? selecionados.filter((selecionado) => selecionado !== id)
        : [...selecionados, id]
    )

  const todosSelecionados = prontos.every(({ id }) => selecionados.includes(id))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          {selecionados.length} de {prontos.length} selecionado(s)
        </span>
        <button
          type="button"
          onClick={() =>
            aoMudar(todosSelecionados ? [] : prontos.map(({ id }) => id))
          }
          className="text-xs font-semibold text-gray-900 underline cursor-pointer"
        >
          {todosSelecionados ? 'Limpar seleção' : 'Selecionar todos'}
        </button>
      </div>
      {disponiveis.length > 5 && (
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-gray-400" />
          <input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar material"
            className={`${classeCampo} pl-9`}
            aria-label="Buscar material"
          />
        </div>
      )}
      <ul className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-1">
        {filtrados.map((material) => {
          const pronto = material.status === 'PRONTO'
          return (
            <li key={material.id}>
              <label
                className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${pronto ? 'cursor-pointer hover:bg-gray-50' : 'opacity-60'}`}
              >
                <input
                  type="checkbox"
                  checked={selecionados.includes(material.id)}
                  onChange={() => alternar(material.id)}
                  disabled={!pronto}
                  className="size-4 accent-black"
                />
                <IconeMaterial
                  tipo={material.tipo}
                  className="size-7 text-base"
                />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {material.nome}
                </span>
                {!pronto && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <LuLoader className="animate-spin" aria-hidden />{' '}
                    processando
                  </span>
                )}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
