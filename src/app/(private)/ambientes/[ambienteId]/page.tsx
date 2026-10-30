'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ReactNode } from 'react'
import {
  LuArrowRight,
  LuClock,
  LuFileText,
  LuLayers,
  LuLibrary,
  LuListChecks,
  LuMessageSquarePlus,
  LuMessagesSquare,
  LuTarget,
  LuTimer,
  LuTrophy,
  LuUpload
} from 'react-icons/lu'
import AnelProgresso from '@/components/AnelProgresso/AnelProgresso'
import IconeTile from '@/components/IconeTile/IconeTile'
import Indicador from '@/components/Indicador/Indicador'
import ModuleCard from '@/components/ModuleCard/ModuleCard'
import { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import { classeCartao } from '@/components/AmbienteEstudo/estilos'
import Esqueleto from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import { useAtividades } from '@/hooks/ambienteEstudo/useAtividades'
import { useChats } from '@/hooks/ambienteEstudo/useChats'
import { useMateriais } from '@/hooks/ambienteEstudo/useMateriais'
import { useSimulados } from '@/hooks/ambienteEstudo/useSimulados'
import {
  formatarDataRelativa,
  formatarNota
} from '@/utils/ambienteEstudo/formatar'
import { ROTULO_TIPO_ATIVIDADE } from '@/utils/ambienteEstudo/rotulos'

/** Seção com o cabeçalho padrão das telas (ícone, título e subtítulo). */
function Secao({
  icone,
  titulo,
  subtitulo,
  acao,
  className,
  children
}: {
  icone: ReactNode
  titulo: string
  subtitulo?: string
  acao?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={clsx(classeCartao, 'space-y-4 p-6 max-md:p-4', className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconeTile>{icone}</IconeTile>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight max-md:text-base">
              {titulo}
            </h2>
            {subtitulo && <p className="text-sm text-gray-500">{subtitulo}</p>}
          </div>
        </div>
        {acao}
      </header>
      {children}
    </section>
  )
}

const ATALHOS = [
  {
    caminho: '/materiais',
    nome: 'Enviar material',
    descricao: 'PDF, slides, documentos, imagens ou texto colado.',
    icon: <LuUpload />
  },
  {
    caminho: '/chats?novo=1',
    nome: 'Novo chat',
    descricao: 'Tire dúvidas com a IA a partir dos seus materiais.',
    icon: <LuMessageSquarePlus />
  },
  {
    caminho: '/resumos?novo=1',
    nome: 'Gerar resumo',
    descricao: 'Tópicos, texto corrido, glossário ou mapa mental.',
    icon: <LuFileText />
  },
  {
    caminho: '/atividades?novo=1',
    nome: 'Gerar atividade',
    descricao: 'Quiz, V/F, lacunas, discursiva ou flashcards.',
    icon: <LuListChecks />
  },
  {
    caminho: '/simulados/novo',
    nome: 'Novo simulado',
    descricao: 'Uma prova com cronômetro e resultado por tópico.',
    icon: <LuTimer />
  }
]

interface ItemContinuar {
  href: string
  titulo: string
  subtitulo: string
  quando: string
  icone: ReactNode
}

export default function VisaoGeralPage() {
  const { ambienteId } = useParams<{ ambienteId: string }>()
  const materiais = useMateriais(ambienteId)
  const chats = useChats(ambienteId)
  const atividades = useAtividades(ambienteId)
  const simulados = useSimulados(ambienteId)
  const base = `/ambientes/${ambienteId}`

  const carregando =
    materiais.isLoading ||
    chats.isLoading ||
    atividades.isLoading ||
    simulados.isLoading

  const continuar: ItemContinuar[] = [
    ...(simulados.data ?? []).flatMap((simulado) =>
      simulado.tentativas
        .filter(({ entregueEm }) => !entregueEm)
        .map((tentativa) => ({
          href: `${base}/simulados/${simulado.id}/tentativas/${tentativa.id}`,
          titulo: simulado.titulo,
          subtitulo: 'Simulado em andamento',
          quando: tentativa.iniciadaEm,
          icone: <LuTimer />
        }))
    ),
    ...(atividades.data ?? [])
      .filter(({ tentativaEmAndamento }) => tentativaEmAndamento)
      .map((atividade) => ({
        href: `${base}/atividades/${atividade.id}`,
        titulo: atividade.titulo,
        subtitulo: `${ROTULO_TIPO_ATIVIDADE[atividade.tipo]} em andamento`,
        quando: atividade.criadoEm,
        icone: <LuListChecks />
      })),
    ...(chats.data ?? []).slice(0, 2).map((chat) => ({
      href: `${base}/chats/${chat.id}`,
      titulo: chat.titulo,
      subtitulo: 'Chat',
      quando: chat.atualizadoEm,
      icone: <LuMessageSquarePlus />
    }))
  ]
    .sort((a, b) => b.quando.localeCompare(a.quando))
    .slice(0, 4)

  const comFlashcards = (atividades.data ?? []).filter(
    ({ tipo }) => tipo === 'FLASHCARDS'
  )
  const pendentes = comFlashcards.reduce(
    (total, { flashcardsPendentes }) => total + flashcardsPendentes,
    0
  )
  const maisPendente = [...comFlashcards].sort(
    (a, b) => b.flashcardsPendentes - a.flashcardsPendentes
  )[0]

  const tentativasEntregues = (simulados.data ?? [])
    .flatMap(({ titulo, id, tentativas }) =>
      tentativas
        .filter(({ resultado }) => resultado)
        .map((tentativa) => ({ titulo, simuladoId: id, tentativa }))
    )
    .sort((a, b) =>
      (b.tentativa.entregueEm ?? '').localeCompare(a.tentativa.entregueEm ?? '')
    )

  // Tópicos com menor taxa de acerto nos simulados e nas atividades.
  const topicos = new Map<string, { acertos: number; total: number }>()
  tentativasEntregues.forEach(({ tentativa }) =>
    tentativa.resultado?.porTopico.forEach(({ topico, acertos, total }) => {
      const atual = topicos.get(topico) ?? { acertos: 0, total: 0 }
      topicos.set(topico, {
        acertos: atual.acertos + acertos,
        total: atual.total + total
      })
    })
  )
  const topicosFracos = [...topicos.entries()]
    .map(([topico, { acertos, total }]) => ({
      topico,
      taxa: acertos / total,
      total
    }))
    .sort((a, b) => a.taxa - b.taxa)
    .slice(0, 4)

  const ultimaNota = tentativasEntregues[0]?.tentativa.resultado?.notaFinal

  return (
    <div className="space-y-4">
      <section
        className={clsx(
          classeCartao,
          'grid grid-cols-2 gap-3 p-4 max-sm:grid-cols-1 xl:grid-cols-4'
        )}
      >
        <Indicador
          label="Materiais"
          carregando={materiais.isLoading}
          value={materiais.data?.length}
          detalhe="na biblioteca"
          icon={
            <IconeTile>
              <LuLibrary />
            </IconeTile>
          }
        />
        <Indicador
          label="Chats"
          carregando={chats.isLoading}
          value={chats.data?.length}
          detalhe="conversas"
          icon={
            <IconeTile>
              <LuMessagesSquare />
            </IconeTile>
          }
        />
        <Indicador
          label="Revisão do dia"
          carregando={atividades.isLoading}
          value={pendentes}
          detalhe="flashcards"
          icon={
            <IconeTile>
              <LuLayers />
            </IconeTile>
          }
        />
        <Indicador
          label="Último simulado"
          carregando={simulados.isLoading}
          value={ultimaNota !== undefined ? formatarNota(ultimaNota) : '-'}
          detalhe="de 10"
          icon={<AnelProgresso percentual={(ultimaNota ?? 0) * 10} />}
        />
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ATALHOS.map((atalho) => (
          <ModuleCard
            key={atalho.nome}
            nome={atalho.nome}
            descricao={atalho.descricao}
            icon={atalho.icon}
            path={`${base}${atalho.caminho}`}
          />
        ))}
      </div>

      {carregando ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          <Esqueleto className="h-48 rounded-2xl lg:col-span-2" />
          <Esqueleto className="h-48 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-3">
          <Secao
            icone={<LuClock />}
            titulo="Continuar de onde parou"
            subtitulo="Atividades, simulados e chats recentes"
            className="lg:col-span-2"
          >
            {continuar.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nada em andamento. Que tal começar enviando um material?
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {continuar.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-gray-50"
                    >
                      <IconeTile className="size-9 text-base">
                        {item.icone}
                      </IconeTile>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-900">
                          {item.titulo}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {item.subtitulo} · {formatarDataRelativa(item.quando)}
                        </span>
                      </span>
                      <LuArrowRight
                        className="text-gray-300 transition-colors group-hover:text-xor-navy"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Secao>

          <Secao
            icone={<LuLayers />}
            titulo="Revisão do dia"
            subtitulo="Revisão espaçada dos flashcards"
          >
            <p className="text-4xl font-bold text-gray-900">
              {pendentes}
              <span className="ml-1 text-sm font-medium text-gray-500">
                {pendentes === 1 ? 'cartão' : 'cartões'} para hoje
              </span>
            </p>
            {maisPendente && pendentes > 0 ? (
              <LinkBotao
                href={`${base}/atividades/${maisPendente.id}?modo=pendentes`}
                variante="primario"
              >
                Revisar agora
              </LinkBotao>
            ) : (
              <LinkBotao href={`${base}/atividades?novo=1&tipo=FLASHCARDS`}>
                Criar flashcards
              </LinkBotao>
            )}
          </Secao>

          <Secao
            icone={<LuTrophy />}
            titulo="Últimos simulados"
            subtitulo="Notas das tentativas entregues"
            className="lg:col-span-2"
            acao={
              <Link
                href={`${base}/simulados`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-xor-navy hover:text-xor-slate"
              >
                Ver simulados
                <LuArrowRight />
              </Link>
            }
          >
            {tentativasEntregues.length === 0 ? (
              <p className="text-sm text-gray-500">
                Você ainda não fez simulados neste ambiente.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {tentativasEntregues
                  .slice(0, 4)
                  .map(({ titulo, simuladoId, tentativa }) => (
                    <li key={tentativa.id}>
                      <Link
                        href={`${base}/simulados/${simuladoId}/tentativas/${tentativa.id}/resultado`}
                        className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-gray-50"
                      >
                        <AnelProgresso
                          percentual={
                            (tentativa.resultado?.notaFinal ?? 0) * 10
                          }
                          className="size-9"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-gray-900">
                            {titulo}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {formatarDataRelativa(
                              tentativa.entregueEm ?? tentativa.iniciadaEm
                            )}
                          </span>
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatarNota(tentativa.resultado?.notaFinal ?? 0)}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </Secao>

          <Secao
            icone={<LuTarget />}
            titulo="Pontos para reforçar"
            subtitulo="Tópicos com menos acertos"
          >
            {topicosFracos.length === 0 ? (
              <p className="text-sm text-gray-500">
                Faça um simulado para descobrir quais tópicos merecem mais
                atenção.
              </p>
            ) : (
              <ul className="space-y-3">
                {topicosFracos.map(({ topico, taxa, total }) => (
                  <li key={topico}>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="truncate font-semibold text-gray-900">
                        {topico}
                      </span>
                      <span className="font-medium text-gray-500">
                        {Math.round(taxa * 100)}%
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-100"
                      role="meter"
                      aria-valuenow={Math.round(taxa * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Acerto em ${topico}`}
                    >
                      <div
                        className="h-full rounded-full bg-xor-navy transition-[width] duration-700"
                        style={{ width: `${Math.max(4, taxa * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {total} {total === 1 ? 'questão' : 'questões'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Secao>
        </div>
      )}
    </div>
  )
}
