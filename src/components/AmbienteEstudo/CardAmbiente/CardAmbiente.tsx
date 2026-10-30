'use client'

import clsx from 'clsx'
import Link from 'next/link'
import {
  LuArchive,
  LuArchiveRestore,
  LuFileText,
  LuListChecks,
  LuMessagesSquare,
  LuPencil,
  LuTimer,
  LuTrash2
} from 'react-icons/lu'
import { AmbienteListagem } from '@/@types/AmbienteEstudo'
import { CORES_AMBIENTE } from '@/utils/ambienteEstudo/cores'
import { formatarDataRelativa } from '@/utils/ambienteEstudo/formatar'
import MenuAcoes from '../MenuAcoes/MenuAcoes'

interface CardAmbienteProps {
  ambiente: AmbienteListagem
  aoEditar: () => void
  aoAlternarArquivo: () => void
  aoExcluir: () => void
}

export default function CardAmbiente({
  ambiente,
  aoEditar,
  aoAlternarArquivo,
  aoExcluir
}: CardAmbienteProps) {
  const cor = CORES_AMBIENTE[ambiente.cor]
  const { contagem } = ambiente

  const contadores = [
    {
      icone: LuFileText,
      valor: contagem.materiais,
      rotulo: 'Materiais',
      aba: 'materiais'
    },
    {
      icone: LuMessagesSquare,
      valor: contagem.chats,
      rotulo: 'Chats',
      aba: 'chats'
    },
    {
      icone: LuListChecks,
      valor: contagem.atividades,
      rotulo: 'Atividades',
      aba: 'atividades'
    },
    {
      icone: LuTimer,
      valor: contagem.simulados,
      rotulo: 'Simulados',
      aba: 'simulados'
    }
  ]

  return (
    <div
      className={clsx(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-shadow hover:shadow-xl',
        ambiente.arquivado && 'opacity-70'
      )}
    >
      <div className={clsx('h-2', cor.solido)} aria-hidden />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/ambientes/${ambiente.id}`}
              className="text-lg font-bold leading-tight text-gray-900 after:absolute after:inset-0 focus-visible:outline-none"
            >
              {ambiente.nome}
            </Link>
            {ambiente.disciplinaCodigo && (
              <p className={clsx('mt-0.5 text-xs font-semibold', cor.texto)}>
                {ambiente.disciplinaCodigo}
              </p>
            )}
          </div>
          <div className="relative z-10">
            <MenuAcoes
              acoes={[
                { rotulo: 'Editar', icone: <LuPencil />, aoClicar: aoEditar },
                {
                  rotulo: ambiente.arquivado ? 'Desarquivar' : 'Arquivar',
                  icone: ambiente.arquivado ? (
                    <LuArchiveRestore />
                  ) : (
                    <LuArchive />
                  ),
                  aoClicar: aoAlternarArquivo
                },
                {
                  rotulo: 'Excluir',
                  icone: <LuTrash2 />,
                  aoClicar: aoExcluir,
                  perigosa: true
                }
              ]}
            />
          </div>
        </div>

        {ambiente.descricao && (
          <p className="line-clamp-2 text-sm text-gray-600">
            {ambiente.descricao}
          </p>
        )}

        <ul className="mt-auto grid grid-cols-4 gap-2 pt-2">
          {contadores.map(({ icone: Icone, valor, rotulo, aba }) => (
            // Acima da camada clicável do card, para receber o mouse; leva à aba.
            <li key={rotulo} className="relative z-10">
              <Link
                href={`/ambientes/${ambiente.id}/${aba}`}
                className="group/contador relative flex flex-col items-center rounded-lg bg-gray-50 py-2 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-black"
              >
                <Icone className="text-gray-500" aria-hidden />
                <span className="mt-0.5 text-sm font-bold">{valor}</span>
                <span className="sr-only">{rotulo}</span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/contador:opacity-100 group-focus-visible/contador:opacity-100"
                >
                  {rotulo}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500">
          Última atividade {formatarDataRelativa(ambiente.ultimaAtividadeEm)}
        </p>
      </div>
    </div>
  )
}
