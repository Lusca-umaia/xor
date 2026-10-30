'use client'

import clsx from 'clsx'
import Link from 'next/link'
import {
  LuCircleAlert,
  LuLayers,
  LuListChecks,
  LuLoader,
  LuPencilLine,
  LuSquareCheck,
  LuTextCursorInput,
  LuTrash2
} from 'react-icons/lu'
import { AtividadeListagem, TipoAtividade } from '@/@types/AmbienteEstudo'
import AnelProgresso from '@/components/AnelProgresso/AnelProgresso'
import { formatarDataRelativa } from '@/utils/ambienteEstudo/formatar'
import {
  aproveitamento,
  assuntosDaAtividade,
  nomeDaAtividade,
  situacaoDaAtividade
} from '@/utils/ambienteEstudo/organizarAtividades'
import { ROTULO_TIPO_ATIVIDADE } from '@/utils/ambienteEstudo/rotulos'
import { classesBotao } from '../Botao/Botao'
import MenuAcoes from '../MenuAcoes/MenuAcoes'

export const ICONE_ATIVIDADE: Record<TipoAtividade, typeof LuListChecks> = {
  QUIZ: LuListChecks,
  VERDADEIRO_FALSO: LuSquareCheck,
  LACUNAS: LuTextCursorInput,
  DISCURSIVA: LuPencilLine,
  FLASHCARDS: LuLayers
}

/** Uma atividade na lista: tipo, assunto, situação e a próxima ação. */
export default function LinhaAtividade({
  atividade,
  href,
  aoExcluir
}: {
  atividade: AtividadeListagem
  href: string
  aoExcluir: () => void
}) {
  const Icone = ICONE_ATIVIDADE[atividade.tipo]
  const situacao = situacaoDaAtividade(atividade)
  const assuntos = assuntosDaAtividade(atividade)
  const nome = nomeDaAtividade(atividade, assuntos)
  const flashcards = atividade.tipo === 'FLASHCARDS'
  const quantidade = flashcards
    ? atividade.flashcards.length
    : atividade.questoes.length
  const taxa = aproveitamento(atividade)
  const clicavel = situacao !== 'GERANDO' && situacao !== 'ERRO'

  // O assunto principal já está no nome; a linha de baixo mostra os demais.
  const outrosAssuntos = assuntos.filter((assunto) => !nome.includes(assunto))
  const detalhes = [
    ROTULO_TIPO_ATIVIDADE[atividade.tipo],
    situacao !== 'GERANDO' &&
      quantidade > 0 &&
      `${quantidade} ${flashcards ? (quantidade === 1 ? 'cartão' : 'cartões') : quantidade === 1 ? 'questão' : 'questões'}`,
    outrosAssuntos.length > 0 &&
      outrosAssuntos.slice(0, 2).join(', ') +
        (outrosAssuntos.length > 2
          ? ` e mais ${outrosAssuntos.length - 2}`
          : ''),
    atividade.ultimaConclusaoEm
      ? `feita ${formatarDataRelativa(atividade.ultimaConclusaoEm)}`
      : `criada ${formatarDataRelativa(atividade.criadoEm)}`
  ].filter(Boolean)

  const acao =
    situacao === 'ANDAMENTO'
      ? { rotulo: 'Continuar', href, destaque: true }
      : situacao === 'REVISAR'
        ? {
            rotulo: `Revisar ${atividade.flashcardsPendentes}`,
            href: `${href}?modo=pendentes`,
            destaque: true
          }
        : situacao === 'NOVA'
          ? { rotulo: 'Começar', href, destaque: true }
          : situacao === 'CONCLUIDA'
            ? {
                rotulo: flashcards ? 'Estudar' : 'Refazer',
                href,
                destaque: false
              }
            : null

  return (
    <li className="group relative flex items-center gap-3 px-2 py-3 max-sm:flex-wrap sm:gap-4">
      <span
        className={clsx(
          'flex size-10 shrink-0 items-center justify-center rounded-xl text-xl ring-1 ring-inset',
          situacao === 'ERRO'
            ? 'bg-red-50 text-red-600 ring-red-600/10'
            : 'bg-xor-navy/5 text-xor-navy ring-xor-navy/10'
        )}
      >
        {situacao === 'GERANDO' ? (
          <LuLoader className="animate-spin" aria-hidden />
        ) : situacao === 'ERRO' ? (
          <LuCircleAlert aria-hidden />
        ) : (
          <Icone aria-hidden />
        )}
      </span>

      <div className="min-w-0 flex-1">
        {clicavel ? (
          <Link
            href={href}
            title={nome}
            className="block truncate font-semibold text-gray-900 after:absolute after:inset-0 after:rounded-xl group-hover:text-xor-navy focus-visible:outline-none"
          >
            {nome}
          </Link>
        ) : (
          <p className="truncate font-semibold text-gray-900" title={nome}>
            {nome}
          </p>
        )}
        <p className="truncate text-xs text-gray-500">
          {situacao === 'GERANDO'
            ? 'Gerando a partir dos seus materiais...'
            : situacao === 'ERRO'
              ? (atividade.mensagemErro ?? 'Não foi possível gerar.')
              : detalhes.join(' · ')}
        </p>
      </div>

      {/* Situação: aproveitamento, cartões pendentes ou andamento. No celular,
          vai para uma segunda linha para não espremer o título. */}
      <div className="flex shrink-0 items-center gap-3 max-sm:order-last max-sm:basis-full max-sm:pl-13 max-sm:empty:hidden">
        {situacao === 'CONCLUIDA' && taxa !== null && (
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <AnelProgresso
              percentual={taxa * 100}
              espessura={6}
              className="size-7"
            />
            {atividade.melhorResultado!.acertos}/
            {atividade.melhorResultado!.total}
          </span>
        )}
        {situacao === 'CONCLUIDA' && flashcards && (
          <span className="text-xs font-semibold text-lime-700">
            Revisão em dia
          </span>
        )}
        {situacao === 'ANDAMENTO' && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
            Em andamento
          </span>
        )}
        {situacao === 'REVISAR' && (
          <span className="rounded-full bg-xor-navy px-2 py-0.5 text-xs font-semibold text-white">
            {atividade.flashcardsPendentes} para hoje
          </span>
        )}
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-1">
        {acao && (
          <Link
            href={acao.href}
            className={clsx(
              classesBotao(acao.destaque ? 'primario' : 'secundario', 'sm'),
              'max-sm:hidden'
            )}
          >
            {acao.rotulo}
          </Link>
        )}
        <MenuAcoes
          acoes={[
            {
              rotulo: 'Excluir',
              icone: <LuTrash2 />,
              aoClicar: aoExcluir,
              perigosa: true
            }
          ]}
        />
      </div>
    </li>
  )
}
