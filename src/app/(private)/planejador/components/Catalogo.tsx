'use client'
import clsx from 'clsx'
import { useState } from 'react'
import { LuGripVertical, LuPlus, LuTrash2 } from 'react-icons/lu'
import type { Pendencias } from '@/utils/academico/planejador'
import type { ItemCatalogo } from '@/utils/academico/planejador'

export interface LinhaCatalogo {
  item: ItemCatalogo
  pend: Pendencias
}

interface Props {
  linhas: LinhaCatalogo[]
  onArrastar: (e: React.DragEvent, codigo: string) => void
  onAdicionar: (codigo: string) => void
  onSoltarRemover: (codigo: string) => void
  onExcluir: (codigo: string) => void
}

const GRUPOS = [
  { chave: 'OBRIGATORIA', rotulo: 'Obrigatórias que faltam' },
  { chave: 'OPTATIVA', rotulo: 'Optativas' },
  { chave: 'PROPRIAS', rotulo: 'Cadastradas por mim' }
] as const

const Catalogo: React.FC<Props> = ({
  linhas,
  onArrastar,
  onAdicionar,
  onSoltarRemover,
  onExcluir
}) => {
  const [grupo, setGrupo] =
    useState<(typeof GRUPOS)[number]['chave']>('OBRIGATORIA')
  const [busca, setBusca] = useState('')
  const [bloqueadas, setBloqueadas] = useState(false)
  const [sobre, setSobre] = useState(false)

  const termo = busca.trim().toLowerCase()
  const doGrupo = linhas.filter(({ item }) =>
    grupo === 'PROPRIAS'
      ? item.personalizada
      : !item.personalizada && item.carater === grupo
  )
  const visiveis = doGrupo.filter(
    ({ item, pend }) =>
      (bloqueadas || pend.faltam.length === 0) &&
      (!termo || `${item.codigo} ${item.nome}`.toLowerCase().includes(termo))
  )
  const escondidas = doGrupo.length - visiveis.length

  return (
    <div
      // Soltar aqui tira a disciplina do plano.
      onDragOver={(e) => {
        e.preventDefault()
        setSobre(true)
      }}
      onDragLeave={() => setSobre(false)}
      onDrop={(e) => {
        e.preventDefault()
        setSobre(false)
        const codigo = e.dataTransfer.getData('text/plain')
        if (codigo) onSoltarRemover(codigo)
      }}
      className={clsx(
        'space-y-3 rounded-xl border-2 border-dashed p-2 duration-150',
        sobre ? 'border-red-300 bg-red-50' : 'border-transparent'
      )}
    >
      <div role="tablist" className="flex flex-wrap gap-1">
        {GRUPOS.map(({ chave, rotulo }) => (
          <button
            key={chave}
            type="button"
            role="tab"
            aria-selected={grupo === chave}
            onClick={() => setGrupo(chave)}
            className={clsx(
              'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold',
              grupo === chave
                ? 'bg-black text-white'
                : 'text-gray-600 ring-1 ring-gray-300 ring-inset hover:bg-gray-100'
            )}
          >
            {rotulo}
          </button>
        ))}
      </div>
      <input
        aria-label="Buscar disciplina"
        placeholder="Buscar por código ou nome"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
      />
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={bloqueadas}
          onChange={(e) => setBloqueadas(e.target.checked)}
          className="size-4 accent-black"
        />
        Mostrar também as bloqueadas por pré-requisito
      </label>

      <ul className="max-h-[28rem] space-y-1.5 overflow-y-auto pr-1">
        {visiveis.length === 0 && (
          <li className="text-sm text-gray-500">
            Nada para mostrar aqui
            {escondidas > 0 && ` (${escondidas} bloqueadas por pré-requisito)`}.
          </li>
        )}
        {visiveis.map(({ item, pend }) => {
          const bloqueada = pend.faltam.length > 0
          return (
            <li
              key={item.codigo}
              draggable={!bloqueada}
              onDragStart={(e) => onArrastar(e, item.codigo)}
              className={clsx(
                'flex items-start gap-2 rounded-lg border bg-white p-2 text-sm',
                bloqueada
                  ? 'border-gray-100 opacity-60'
                  : 'cursor-grab border-gray-200 shadow-sm'
              )}
            >
              {!bloqueada && (
                <LuGripVertical className="mt-0.5 shrink-0 text-gray-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">
                  {item.codigo} · {item.nome}
                </p>
                <p className="text-xs text-gray-500">
                  {item.cargaHoraria}h
                  {item.horarios.length === 0 && ' · sem horário conhecido'}
                </p>
                {bloqueada && (
                  <p className="text-xs font-medium text-red-700">
                    Falta: {pend.faltam.join(', ')}
                  </p>
                )}
                {pend.emAndamento.length > 0 && !bloqueada && (
                  <p className="text-xs text-amber-700">
                    Depende de aprovação em {pend.emAndamento.join(', ')}{' '}
                    (cursando)
                  </p>
                )}
              </div>
              {!bloqueada && (
                <button
                  type="button"
                  aria-label={`Adicionar ${item.nome} ao plano`}
                  onClick={() => onAdicionar(item.codigo)}
                  className="cursor-pointer rounded-md p-1.5 text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-100"
                >
                  <LuPlus />
                </button>
              )}
              {item.personalizada && (
                <button
                  type="button"
                  aria-label={`Excluir ${item.nome}`}
                  onClick={() => onExcluir(item.codigo)}
                  className="cursor-pointer p-1.5 text-gray-400 hover:text-red-600"
                >
                  <LuTrash2 />
                </button>
              )}
            </li>
          )
        })}
        {visiveis.length > 0 && escondidas > 0 && (
          <li className="text-xs text-gray-500">
            + {escondidas} bloqueadas por pré-requisito (marque a opção acima
            para ver).
          </li>
        )}
      </ul>
    </div>
  )
}

export default Catalogo
