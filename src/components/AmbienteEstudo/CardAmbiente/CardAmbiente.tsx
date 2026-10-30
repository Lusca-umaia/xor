'use client'

import clsx from 'clsx'
import Link from 'next/link'
import {
  LuArchive,
  LuArchiveRestore,
  LuClock,
  LuFileText,
  LuListChecks,
  LuMessagesSquare,
  LuPencil,
  LuTimer,
  LuTrash2
} from 'react-icons/lu'
import { AmbienteListagem, SituacaoCadeira } from '@/@types/AmbienteEstudo'
import { CORES_AMBIENTE } from '@/utils/ambienteEstudo/cores'
import { formatarDataRelativa } from '@/utils/ambienteEstudo/formatar'
import MenuAcoes from '../MenuAcoes/MenuAcoes'
import SeloSituacao from '../SeloSituacao/SeloSituacao'

interface CardAmbienteProps {
  ambiente: AmbienteListagem
  /** Situação da cadeira no histórico; null para ambiente livre. */
  situacao?: SituacaoCadeira | null
  aoEditar: () => void
  aoAlternarArquivo: () => void
  aoExcluir: () => void
}

export default function CardAmbiente({
  ambiente,
  situacao = null,
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

  // Mesmo desenho do DisciplineCard: faixa curta de destaque no topo,
  // código em fonte mono e selo de status.
  return (
    <div
      className={clsx(
        'group relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 pt-6 shadow-sm transition duration-200 hover:border-gray-200 hover:shadow-lg',
        ambiente.arquivado && 'opacity-70'
      )}
    >
      <span
        aria-hidden
        className={clsx(
          'absolute top-0 left-5 h-1 w-10 rounded-b-full',
          cor.solido
        )}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-xs font-semibold text-gray-500">
          {ambiente.disciplinaCodigo ?? 'Tema livre'}
        </span>
        <div className="relative z-10 flex items-center gap-1">
          {situacao && !ambiente.arquivado ? (
            <SeloSituacao situacao={situacao} />
          ) : (
            <span
              className={clsx(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
                ambiente.arquivado
                  ? 'bg-gray-50 text-gray-600 ring-gray-200'
                  : 'bg-xor-navy/5 text-xor-navy ring-xor-navy/20'
              )}
            >
              <span
                className={clsx('size-1.5 rounded-full', cor.solido)}
                aria-hidden
              />
              {ambiente.arquivado ? 'Arquivado' : 'Ambiente livre'}
            </span>
          )}
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

      <div className="space-y-1">
        <Link
          href={`/ambientes/${ambiente.id}`}
          title={ambiente.nome}
          className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-gray-900 after:absolute after:inset-0 focus-visible:outline-none"
        >
          {ambiente.nome}
        </Link>
        {ambiente.descricao && (
          <p className="line-clamp-2 text-sm text-gray-500">
            {ambiente.descricao}
          </p>
        )}
      </div>

      <ul className="mt-auto grid grid-cols-4 gap-2">
        {contadores.map(({ icone: Icone, valor, rotulo, aba }) => (
          // Acima da camada clicável do card, para receber o mouse; leva à aba.
          <li key={rotulo} className="relative z-10">
            <Link
              href={`/ambientes/${ambiente.id}/${aba}`}
              className="group/contador relative flex flex-col items-center rounded-xl bg-gray-50 py-2 ring-1 ring-inset ring-gray-100 transition-colors hover:bg-xor-navy/5 hover:text-xor-navy focus-visible:outline-2 focus-visible:outline-xor-navy"
            >
              <Icone
                className="text-gray-400 group-hover/contador:text-xor-navy"
                aria-hidden
              />
              <span className="mt-0.5 text-sm font-bold">{valor}</span>
              <span className="sr-only">{rotulo}</span>
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-xor-navy px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/contador:opacity-100 group-focus-visible/contador:opacity-100"
              >
                {rotulo}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-1 text-xs font-medium text-gray-500">
        <LuClock aria-hidden />
        Última atividade {formatarDataRelativa(ambiente.ultimaAtividadeEm)}
      </p>
    </div>
  )
}
