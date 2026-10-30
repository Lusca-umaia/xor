'use client'
import clsx from 'clsx'
import { useState } from 'react'
import { deMinutos, dispor, paraMinutos } from '@/utils/academico'
import type { ItemCatalogo } from '@/utils/academico/planejador'

// Grade semanal do plano: faixas de 2 em 2 horas, como no calendário.
const HORA_INICIO = 6
const HORA_FIM = 22
const PX_POR_HORA = 34
const DIAS = [
  { valor: 1, rotulo: 'seg' },
  { valor: 2, rotulo: 'ter' },
  { valor: 3, rotulo: 'qua' },
  { valor: 4, rotulo: 'qui' },
  { valor: 5, rotulo: 'sex' },
  { valor: 6, rotulo: 'sáb' }
]
const altura = (HORA_FIM - HORA_INICIO) * PX_POR_HORA
const faixas = Array.from(
  { length: (HORA_FIM - HORA_INICIO) / 2 },
  (_, i) => HORA_INICIO + i * 2
)
const CORES = [
  'border-blue-500 bg-blue-100 text-blue-900',
  'border-emerald-500 bg-emerald-100 text-emerald-900',
  'border-violet-500 bg-violet-100 text-violet-900',
  'border-amber-500 bg-amber-100 text-amber-900',
  'border-pink-500 bg-pink-100 text-pink-900',
  'border-cyan-500 bg-cyan-100 text-cyan-900'
]

interface Props {
  itens: ItemCatalogo[]
  emConflito: Set<string>
  onSoltar: (codigo: string) => void
  onArrastar: (e: React.DragEvent, codigo: string) => void
  onRemover: (codigo: string) => void
}

const GradePlano: React.FC<Props> = ({
  itens,
  emConflito,
  onSoltar,
  onArrastar,
  onRemover
}) => {
  const [sobre, setSobre] = useState(false)

  const blocosDoDia = (dia: number) =>
    dispor(
      itens.flatMap((item, i) =>
        item.horarios
          .filter((h) => h.dias.includes(dia))
          .map((h) => ({
            item,
            cor: i % CORES.length,
            inicio: paraMinutos(h.inicio),
            fim: paraMinutos(h.fim)
          }))
      )
    )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setSobre(true)
      }}
      onDragLeave={() => setSobre(false)}
      onDrop={(e) => {
        e.preventDefault()
        setSobre(false)
        const codigo = e.dataTransfer.getData('text/plain')
        if (codigo) onSoltar(codigo)
      }}
      className={clsx(
        'overflow-x-auto rounded-xl border-2 border-dashed duration-150',
        sobre ? 'border-xor-navy bg-xor-navy/5' : 'border-gray-200'
      )}
    >
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[3rem_repeat(6,minmax(0,1fr))] border-b border-gray-100 bg-white">
          <div />
          {DIAS.map((d) => (
            <p
              key={d.valor}
              className="py-2 text-center text-xs font-semibold uppercase text-gray-500"
            >
              {d.rotulo}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-[3rem_repeat(6,minmax(0,1fr))] bg-white">
          <div className="relative" style={{ height: altura }}>
            {faixas.slice(1).map((h) => (
              <span
                key={h}
                className="absolute right-1 -translate-y-1/2 text-[10px] font-medium text-gray-400"
                style={{ top: (h - HORA_INICIO) * PX_POR_HORA }}
              >
                {deMinutos(h * 60)}
              </span>
            ))}
          </div>
          {DIAS.map((d) => (
            <div
              key={d.valor}
              className="relative border-l border-gray-100"
              style={{ height: altura }}
            >
              {faixas.map((h) => (
                <div
                  key={h}
                  className="border-t border-gray-100"
                  style={{ height: 2 * PX_POR_HORA }}
                />
              ))}
              {blocosDoDia(d.valor).map((b) => {
                const inicio = Math.max(b.inicio, HORA_INICIO * 60)
                const fim = Math.min(b.fim, HORA_FIM * 60)
                const conflito = emConflito.has(b.item.codigo)
                return (
                  <div
                    key={`${b.item.codigo}-${b.inicio}`}
                    draggable
                    onDragStart={(e) => onArrastar(e, b.item.codigo)}
                    title={`${b.item.nome} · ${deMinutos(b.inicio)} às ${deMinutos(b.fim)}${conflito ? ' · CONFLITO DE HORÁRIO' : ''}`}
                    className={clsx(
                      'group absolute cursor-grab overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-[11px] leading-tight shadow-sm',
                      conflito
                        ? 'border-red-600 bg-red-100 text-red-900 ring-2 ring-red-400'
                        : CORES[b.cor]
                    )}
                    style={{
                      top: ((inicio - HORA_INICIO * 60) / 60) * PX_POR_HORA + 1,
                      height: Math.max(
                        18,
                        ((fim - inicio) / 60) * PX_POR_HORA - 2
                      ),
                      left: `calc(${(b.faixa / b.faixas) * 100}% + 2px)`,
                      width: `calc(${100 / b.faixas}% - 4px)`
                    }}
                  >
                    <p className="truncate font-semibold">{b.item.nome}</p>
                    <p className="truncate opacity-70">
                      {deMinutos(b.inicio)} – {deMinutos(b.fim)}
                    </p>
                    <button
                      type="button"
                      aria-label={`Remover ${b.item.nome} do plano`}
                      onClick={() => onRemover(b.item.codigo)}
                      className="absolute top-0.5 right-1 hidden cursor-pointer font-bold group-hover:block"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GradePlano
