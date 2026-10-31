'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import {
  LuArrowRight,
  LuFileText,
  LuHistory,
  LuListChecks,
  LuMessagesSquare,
  LuTimer
} from 'react-icons/lu'
import type { ItemRetomar, ResumoCadeira } from '@/@types/AmbienteEstudo'
import IconeTile from '@/components/IconeTile/IconeTile'
import { formatarDataRelativa } from '@/utils/ambienteEstudo/formatar'
import { hrefRetomar, rotuloRetomar } from '../utils/estudoCadeira'

const ICONE: Record<ItemRetomar['tipo'], ReactNode> = {
  SIMULADO: <LuTimer />,
  ATIVIDADE: <LuListChecks />,
  CHAT: <LuMessagesSquare />,
  RESUMO: <LuFileText />
}

const QUANTIDADE = 3

/**
 * O que o aluno estava fazendo nos ambientes das cadeiras: primeiro o que
 * ficou pela metade, depois o mais recente. Some quando não há nada.
 */
const ContinuarEstudo = ({
  resumos,
  nomeDaCadeira
}: {
  resumos: ResumoCadeira[]
  nomeDaCadeira: (codigo: string) => string | undefined
}) => {
  const itens = resumos
    .flatMap((resumo) =>
      resumo.retomar.map((item) => ({
        item,
        href: hrefRetomar(resumo.ambienteId, item),
        cadeira: nomeDaCadeira(resumo.disciplinaCodigo)
      }))
    )
    .sort(
      (a, b) =>
        Number(b.item.emAndamento) - Number(a.item.emAndamento) ||
        b.item.quando.localeCompare(a.item.quando)
    )
    .slice(0, QUANTIDADE)

  if (itens.length === 0) return null

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg max-md:p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconeTile>
            <LuHistory />
          </IconeTile>
          <h2 className="text-lg font-bold tracking-tight max-md:text-base">
            Continuar de onde parou
          </h2>
        </div>
        <Link
          href="/ambientes"
          className="inline-flex items-center gap-1 text-sm font-semibold text-xor-navy hover:text-xor-slate"
        >
          Ambientes
          <LuArrowRight />
        </Link>
      </header>

      <ul className="space-y-2">
        {itens.map(({ item, href, cadeira }) => (
          <li key={`${item.tipo}-${item.id}`}>
            <Link
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-inset ring-gray-100 transition hover:bg-gray-50 hover:ring-gray-200"
            >
              <span className="shrink-0 text-gray-400">{ICONE[item.tipo]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {item.titulo}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {cadeira ? `${cadeira} · ` : ''}
                  {rotuloRetomar(item)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">
                {formatarDataRelativa(item.quando)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ContinuarEstudo
