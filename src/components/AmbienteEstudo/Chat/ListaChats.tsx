'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'
import {
  LuPencil,
  LuPin,
  LuPinOff,
  LuPlus,
  LuSearch,
  LuTrash2
} from 'react-icons/lu'
import { Chat } from '@/@types/AmbienteEstudo'
import { formatarDataRelativa } from '@/utils/ambienteEstudo/formatar'
import { normalizarTexto } from '@/utils/historicoAcademico'
import Botao from '../Botao/Botao'
import Skeleton from '@/components/Skeleton/Skeleton'
import { classeCampo } from '../estilos'
import MenuAcoes from '../MenuAcoes/MenuAcoes'

interface ListaChatsProps {
  ambienteId: string
  chats: Chat[] | undefined
  chatAtivoId: string | null
  aoNovo: () => void
  aoRenomear: (chat: Chat) => void
  aoAlternarFixado: (chat: Chat) => void
  aoExcluir: (chat: Chat) => void
}

export default function ListaChats({
  ambienteId,
  chats,
  chatAtivoId,
  aoNovo,
  aoRenomear,
  aoAlternarFixado,
  aoExcluir
}: ListaChatsProps) {
  const [busca, setBusca] = useState('')
  const filtrados = (chats ?? []).filter(({ titulo }) =>
    normalizarTexto(titulo).includes(normalizarTexto(busca))
  )

  return (
    <div className="flex h-full flex-col gap-3">
      <Botao
        variante="primario"
        icone={<LuPlus aria-hidden />}
        onClick={aoNovo}
      >
        Novo chat
      </Botao>
      {(chats?.length ?? 0) > 4 && (
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-gray-400" />
          <input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar chats"
            aria-label="Buscar chats"
            className={clsx(classeCampo, 'mt-0 pl-9')}
          />
        </div>
      )}
      <nav aria-label="Chats" className="-mx-1 flex-1 overflow-y-auto px-1">
        {!chats ? (
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : filtrados.length === 0 ? (
          <p className="px-2 py-4 text-sm text-gray-500">
            {chats.length === 0
              ? 'Nenhum chat ainda.'
              : 'Nenhum chat encontrado.'}
          </p>
        ) : (
          <ul className="space-y-1">
            {filtrados.map((chat) => {
              const ativo = chat.id === chatAtivoId
              return (
                <li
                  key={chat.id}
                  className={clsx(
                    'group relative flex items-center gap-1 rounded-xl pr-1',
                    ativo ? 'bg-black text-white' : 'hover:bg-gray-100'
                  )}
                >
                  <Link
                    href={`/ambientes/${ambienteId}/chats/${chat.id}`}
                    aria-current={ativo ? 'page' : undefined}
                    className="min-w-0 flex-1 px-3 py-2"
                  >
                    <span className="flex items-center gap-1 truncate text-sm font-semibold">
                      {chat.fixado && (
                        <LuPin
                          className="shrink-0 text-xs"
                          aria-label="Fixado"
                        />
                      )}
                      <span className="truncate">{chat.titulo}</span>
                    </span>
                    <span
                      className={clsx(
                        'block text-xs',
                        ativo ? 'text-gray-300' : 'text-gray-500'
                      )}
                    >
                      {chat.modo === 'TUTOR' ? 'Tutor' : 'Explicação'} ·{' '}
                      {formatarDataRelativa(chat.atualizadoEm)}
                    </span>
                  </Link>
                  <div className={clsx(ativo && '[&_button]:text-gray-300')}>
                    <MenuAcoes
                      rotulo={`Ações do chat ${chat.titulo}`}
                      acoes={[
                        {
                          rotulo: 'Renomear',
                          icone: <LuPencil />,
                          aoClicar: () => aoRenomear(chat)
                        },
                        {
                          rotulo: chat.fixado ? 'Desafixar' : 'Fixar no topo',
                          icone: chat.fixado ? <LuPinOff /> : <LuPin />,
                          aoClicar: () => aoAlternarFixado(chat)
                        },
                        {
                          rotulo: 'Excluir',
                          icone: <LuTrash2 />,
                          perigosa: true,
                          aoClicar: () => aoExcluir(chat)
                        }
                      ]}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </div>
  )
}
