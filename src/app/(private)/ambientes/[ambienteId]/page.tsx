'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ReactNode, useMemo } from 'react'
import {
  LuArrowRight,
  LuAward,
  LuCalendarCheck,
  LuChartColumn,
  LuCircleCheck,
  LuCircle,
  LuClock,
  LuFileText,
  LuFlame,
  LuLayers,
  LuLibrary,
  LuListChecks,
  LuLock,
  LuMessageSquarePlus,
  LuMessagesSquare,
  LuRocket,
  LuSparkles,
  LuStar,
  LuTarget,
  LuTimer,
  LuTrendingDown,
  LuTrendingUp,
  LuTrophy,
  LuUpload,
  LuZap
} from 'react-icons/lu'
import AnelProgresso from '@/components/AnelProgresso/AnelProgresso'
import IconeTile from '@/components/IconeTile/IconeTile'
import { LinkBotao } from '@/components/AmbienteEstudo/Botao/Botao'
import { classeCartao } from '@/components/AmbienteEstudo/estilos'
import Esqueleto from '@/components/AmbienteEstudo/Esqueleto/Esqueleto'
import { useAtividades } from '@/hooks/ambienteEstudo/useAtividades'
import { useChats } from '@/hooks/ambienteEstudo/useChats'
import { useMateriais } from '@/hooks/ambienteEstudo/useMateriais'
import { useResumos } from '@/hooks/ambienteEstudo/useResumos'
import { useSimulados } from '@/hooks/ambienteEstudo/useSimulados'
import {
  calcularXp,
  conquistas,
  DadosGamificacao,
  diasDeEstudo,
  dominioPorTopico,
  missoesDoDia,
  nivelDe,
  REGRAS_XP,
  semana,
  sequenciaDeDias,
  tentativasEntregues
} from '@/utils/ambienteEstudo/gamificacao'
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
      className={clsx(
        classeCartao,
        'flex flex-col gap-4 p-6 max-md:p-4',
        className
      )}
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

function LinkSecao({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-xor-navy hover:text-xor-slate"
    >
      {children}
      <LuArrowRight aria-hidden />
    </Link>
  )
}

const ATALHOS = [
  { caminho: '/materiais', nome: 'Enviar material', icone: <LuUpload /> },
  {
    caminho: '/chats?novo=1',
    nome: 'Novo chat',
    icone: <LuMessageSquarePlus />
  },
  { caminho: '/resumos?novo=1', nome: 'Gerar resumo', icone: <LuFileText /> },
  {
    caminho: '/atividades?novo=1',
    nome: 'Gerar atividade',
    icone: <LuListChecks />
  },
  { caminho: '/simulados/novo', nome: 'Novo simulado', icone: <LuTimer /> }
]

const ICONE_CONQUISTA: Record<string, ReactNode> = {
  'primeiro-material': <LuRocket />,
  biblioteca: <LuLibrary />,
  curioso: <LuMessagesSquare />,
  praticante: <LuListChecks />,
  memoria: <LuLayers />,
  simulado: <LuTimer />,
  excelencia: <LuStar />,
  superacao: <LuTrendingUp />,
  constancia: <LuFlame />
}

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
  const resumos = useResumos(ambienteId)
  const atividades = useAtividades(ambienteId)
  const simulados = useSimulados(ambienteId)
  const base = `/ambientes/${ambienteId}`

  const carregando =
    materiais.isLoading ||
    chats.isLoading ||
    resumos.isLoading ||
    atividades.isLoading ||
    simulados.isLoading

  const painel = useMemo(() => {
    const dados: DadosGamificacao = {
      materiais: materiais.data ?? [],
      chats: chats.data ?? [],
      resumos: resumos.data ?? [],
      atividades: atividades.data ?? [],
      simulados: simulados.data ?? []
    }
    const xp = calcularXp(dados)
    const dias = diasDeEstudo(dados)
    const { sequencia, estudouHoje } = sequenciaDeDias(dias)

    const continuar: ItemContinuar[] = [
      ...dados.simulados.flatMap((simulado) =>
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
      ...dados.atividades
        .filter(({ tentativaEmAndamento }) => tentativaEmAndamento)
        .map((atividade) => ({
          href: `${base}/atividades/${atividade.id}`,
          titulo: atividade.titulo,
          subtitulo: `${ROTULO_TIPO_ATIVIDADE[atividade.tipo]} em andamento`,
          quando: atividade.criadoEm,
          icone: <LuListChecks />
        })),
      ...dados.chats.slice(0, 3).map((chat) => ({
        href: `${base}/chats/${chat.id}`,
        titulo: chat.titulo,
        subtitulo: 'Chat',
        quando: chat.atualizadoEm,
        icone: <LuMessagesSquare />
      })),
      ...dados.resumos
        .filter(({ status }) => status === 'PRONTO')
        .slice(0, 2)
        .map((resumo) => ({
          href: `${base}/resumos/${resumo.id}`,
          titulo: resumo.titulo,
          subtitulo: 'Resumo',
          quando: resumo.atualizadoEm,
          icone: <LuFileText />
        }))
    ]
      .sort((a, b) => b.quando.localeCompare(a.quando))
      .slice(0, 4)

    return {
      xp,
      nivel: nivelDe(xp),
      sequencia,
      estudouHoje,
      semana: semana(dias),
      missoes: missoesDoDia(dados, base, { estudouHoje, sequencia }),
      conquistas: conquistas(dados, sequencia),
      dominio: dominioPorTopico(dados.simulados),
      entregues: tentativasEntregues(dados.simulados),
      continuar,
      contagem: [
        {
          rotulo: 'Materiais',
          valor: dados.materiais.length,
          aba: 'materiais'
        },
        { rotulo: 'Chats', valor: dados.chats.length, aba: 'chats' },
        {
          rotulo: 'Atividades',
          valor: dados.atividades.length,
          aba: 'atividades'
        },
        { rotulo: 'Simulados', valor: dados.simulados.length, aba: 'simulados' }
      ]
    }
  }, [
    materiais.data,
    chats.data,
    resumos.data,
    atividades.data,
    simulados.data,
    base
  ])

  if (carregando) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
        <Esqueleto className="h-56 rounded-2xl lg:col-span-2" />
        <Esqueleto className="h-56 rounded-2xl" />
        <Esqueleto className="h-20 rounded-2xl lg:col-span-3" />
        <Esqueleto className="h-64 rounded-2xl lg:col-span-2" />
        <Esqueleto className="h-64 rounded-2xl" />
      </div>
    )
  }

  const { nivel } = painel
  const missoesFeitas = painel.missoes.filter((m) => m.concluida).length
  const desbloqueadas = painel.conquistas.filter((c) => c.desbloqueada).length

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-stretch gap-4 lg:grid-cols-3">
      {/* Progresso: nível, XP e sequência de estudo. */}
      <section
        className={clsx(
          classeCartao,
          'flex flex-col gap-6 p-6 max-md:p-4 lg:col-span-2'
        )}
      >
        <div className="flex flex-wrap items-center gap-6 max-sm:gap-4">
          <AnelProgresso
            percentual={(nivel.xpNoNivel / nivel.xpDoNivel) * 100}
            espessura={4}
            className="size-28 max-sm:size-20"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Nível
            </span>
            <span className="text-3xl font-bold leading-none text-gray-900 max-sm:text-2xl">
              {nivel.nivel}
            </span>
          </AnelProgresso>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Seu domínio nesta cadeira
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 max-sm:text-xl">
              {nivel.titulo}
            </h2>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-gray-100"
              role="meter"
              aria-label="XP no nível atual"
              aria-valuenow={nivel.xpNoNivel}
              aria-valuemin={0}
              aria-valuemax={nivel.xpDoNivel}
            >
              <div
                className="h-full rounded-full bg-xor-lime transition-[width] duration-700"
                style={{
                  width: `${Math.max(3, (nivel.xpNoNivel / nivel.xpDoNivel) * 100)}%`
                }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                <LuZap className="text-xor-navy" aria-hidden />
                {painel.xp} XP
              </span>
              <span>
                Faltam {nivel.faltam} XP para o nível {nivel.nivel + 1}
              </span>
              <details className="relative">
                <summary className="cursor-pointer list-none font-semibold text-xor-navy hover:text-xor-slate [&::-webkit-details-marker]:hidden">
                  Como ganhar XP?
                </summary>
                <ul className="absolute left-0 z-20 mt-2 w-72 space-y-1.5 rounded-xl bg-white p-4 text-xs text-gray-600 shadow-lg ring-1 ring-gray-100 max-sm:-left-24">
                  {REGRAS_XP.map(({ acao, xp }) => (
                    <li key={acao} className="flex justify-between gap-3">
                      <span>{acao}</span>
                      <span className="shrink-0 font-semibold text-gray-900">
                        +{xp}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-inset ring-gray-100">
            <span
              className={clsx(
                'flex size-10 items-center justify-center rounded-xl text-xl',
                painel.sequencia > 0
                  ? 'bg-xor-lime text-xor-navy'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              <LuFlame aria-hidden />
            </span>
            <div>
              <p className="text-xl font-bold leading-tight text-gray-900">
                {painel.sequencia}{' '}
                <span className="text-sm font-medium text-gray-500">
                  {painel.sequencia === 1 ? 'dia seguido' : 'dias seguidos'}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {painel.estudouHoje
                  ? 'Você já estudou hoje'
                  : 'Estude hoje para não perder'}
              </p>
            </div>
          </div>
          <ol
            className="grid grid-cols-7 gap-2"
            aria-label="Dias com estudo nos últimos 7 dias"
          >
            {painel.semana.map((dia) => (
              <li
                key={dia.data}
                className="flex flex-col items-center gap-1"
                title={`${dia.data}: ${dia.estudou ? 'estudou' : 'sem estudo'}`}
              >
                <span
                  className={clsx(
                    'flex size-8 items-center justify-center rounded-full text-sm',
                    dia.estudou
                      ? 'bg-xor-navy text-xor-lime'
                      : 'bg-gray-100 text-gray-300',
                    dia.hoje && 'ring-2 ring-xor-lime ring-offset-2'
                  )}
                >
                  {dia.estudou ? (
                    <LuFlame aria-hidden />
                  ) : (
                    <LuCircle aria-hidden />
                  )}
                  <span className="sr-only">
                    {dia.data}: {dia.estudou ? 'estudou' : 'sem estudo'}
                  </span>
                </span>
                <span
                  className={clsx(
                    'text-[11px] font-semibold',
                    dia.hoje ? 'text-gray-900' : 'text-gray-400'
                  )}
                >
                  {dia.hoje ? 'Hoje' : dia.rotulo}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <ul className="mt-auto grid grid-cols-4 gap-2 max-sm:grid-cols-2">
          {painel.contagem.map(({ rotulo, valor, aba }) => (
            <li key={aba}>
              <Link
                href={`${base}/${aba}`}
                className="flex flex-col rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-inset ring-gray-100 transition-colors hover:bg-xor-navy/5"
              >
                <span className="text-lg font-bold text-gray-900">{valor}</span>
                <span className="text-xs font-medium text-gray-500">
                  {rotulo}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Missões do dia. */}
      <Secao
        icone={<LuCalendarCheck />}
        titulo="Missões de hoje"
        subtitulo={`${missoesFeitas} de ${painel.missoes.length} concluídas`}
      >
        <ul className="flex flex-1 flex-col gap-2">
          {painel.missoes.map((missao) => (
            <li key={missao.id}>
              <Link
                href={missao.href}
                className={clsx(
                  'group flex items-start gap-3 rounded-xl p-3 ring-1 ring-inset transition-colors',
                  missao.concluida
                    ? 'bg-lime-50/60 ring-lime-600/15'
                    : 'ring-gray-100 hover:bg-gray-50 hover:ring-gray-200'
                )}
              >
                {missao.concluida ? (
                  <LuCircleCheck
                    className="mt-0.5 shrink-0 text-lg text-lime-600"
                    aria-label="Concluída"
                  />
                ) : (
                  <LuCircle
                    className="mt-0.5 shrink-0 text-lg text-gray-300 group-hover:text-xor-navy"
                    aria-label="Pendente"
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={clsx(
                      'block text-sm font-semibold',
                      missao.concluida ? 'text-gray-500' : 'text-gray-900'
                    )}
                  >
                    {missao.titulo}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {missao.detalhe}
                  </span>
                </span>
                {!missao.concluida && (
                  <LuArrowRight
                    className="mt-0.5 shrink-0 text-gray-300 group-hover:text-xor-navy"
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
        {missoesFeitas === painel.missoes.length && (
          <p className="flex items-center gap-2 rounded-xl bg-xor-navy px-3 py-2 text-sm font-semibold text-white">
            <LuSparkles className="text-xor-lime" aria-hidden />
            Tudo feito por hoje. Mandou bem!
          </p>
        )}
      </Secao>

      {/* Ações rápidas, numa faixa só. */}
      <nav
        aria-label="Ações rápidas"
        className={clsx(
          classeCartao,
          'grid grid-cols-5 gap-2 p-2 max-md:grid-cols-3 max-sm:grid-cols-2 lg:col-span-3'
        )}
      >
        {ATALHOS.map((atalho, i) => (
          <Link
            key={atalho.nome}
            href={`${base}${atalho.caminho}`}
            className={clsx(
              'group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50 max-md:flex-col max-md:gap-2 max-md:text-center',
              // No celular, o último atalho ocupa a linha inteira.
              i === ATALHOS.length - 1 && 'max-sm:col-span-2'
            )}
          >
            <IconeTile className="transition-colors group-hover:bg-xor-navy group-hover:text-white">
              {atalho.icone}
            </IconeTile>
            <span className="text-sm font-semibold text-gray-900">
              {atalho.nome}
            </span>
          </Link>
        ))}
      </nav>

      <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
        <Secao
          icone={<LuClock />}
          titulo="Continuar de onde parou"
          subtitulo="Simulados, atividades, chats e resumos recentes"
        >
          {painel.continuar.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nada por aqui ainda. Comece enviando um material ou abrindo um
              chat.
            </p>
          ) : (
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
              {painel.continuar.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl p-3 ring-1 ring-inset ring-gray-100 transition-colors hover:bg-gray-50 hover:ring-gray-200"
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
                      className="shrink-0 text-gray-300 transition-colors group-hover:text-xor-navy"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <EvolucaoSimulados base={base} entregues={painel.entregues} />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Secao
          icone={<LuTarget />}
          titulo="Domínio por tópico"
          className="flex-1"
          subtitulo="Acerto nos simulados, do mais fraco ao mais forte"
        >
          {painel.dominio.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Faça um simulado para descobrir quais tópicos você já domina e
                quais merecem reforço.
              </p>
              <LinkBotao href={`${base}/simulados/novo`} tamanho="sm">
                Fazer simulado
              </LinkBotao>
            </div>
          ) : (
            <ul className="space-y-3">
              {painel.dominio.slice(0, 5).map(({ topico, taxa, total }) => {
                const dominado = taxa >= 0.7
                return (
                  <li key={topico}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-semibold text-gray-900">
                        {topico}
                      </span>
                      {dominado ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-lime-700">
                          <LuCircleCheck aria-hidden /> Dominado
                        </span>
                      ) : (
                        <Link
                          href={`${base}/atividades?novo=1&topico=${encodeURIComponent(topico)}`}
                          className="shrink-0 text-xs font-semibold text-xor-navy hover:text-xor-slate"
                        >
                          Praticar
                        </Link>
                      )}
                    </div>
                    <div
                      className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100"
                      role="meter"
                      aria-valuenow={Math.round(taxa * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Acerto em ${topico}`}
                    >
                      <div
                        className={clsx(
                          'h-full rounded-full transition-[width] duration-700',
                          dominado ? 'bg-xor-lime' : 'bg-xor-navy'
                        )}
                        style={{ width: `${Math.max(4, taxa * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {Math.round(taxa * 100)}% de acerto em {total}{' '}
                      {total === 1 ? 'questão' : 'questões'}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </Secao>
      </div>

      <Secao
        icone={<LuAward />}
        titulo="Conquistas"
        className="lg:col-span-3"
        subtitulo={`${desbloqueadas} de ${painel.conquistas.length} desbloqueadas`}
      >
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {painel.conquistas.map((conquista) => (
            <li
              key={conquista.id}
              title={`${conquista.descricao} (${conquista.atual}/${conquista.meta})`}
              className={clsx(
                'flex flex-col items-center gap-1.5 rounded-xl p-2 text-center ring-1 ring-inset',
                conquista.desbloqueada
                  ? 'bg-xor-navy/5 ring-xor-navy/10'
                  : 'ring-gray-100'
              )}
            >
              <span
                className={clsx(
                  'relative flex size-10 items-center justify-center rounded-full text-lg',
                  conquista.desbloqueada
                    ? 'bg-xor-navy text-xor-lime'
                    : 'bg-gray-100 text-gray-300'
                )}
              >
                {ICONE_CONQUISTA[conquista.id] ?? <LuTrophy />}
                {!conquista.desbloqueada && (
                  <LuLock
                    className="absolute -right-1 -bottom-1 rounded-full bg-white p-0.5 text-sm text-gray-400"
                    aria-hidden
                  />
                )}
              </span>
              <span
                className={clsx(
                  'text-[11px] font-semibold leading-tight',
                  conquista.desbloqueada ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {conquista.nome}
              </span>
              <span className="sr-only">
                {conquista.desbloqueada
                  ? 'Desbloqueada.'
                  : `Bloqueada: ${conquista.descricao}, ${conquista.atual} de ${conquista.meta}.`}
              </span>
              {!conquista.desbloqueada && conquista.meta > 1 && (
                <span className="text-[10px] font-medium text-gray-400">
                  {conquista.atual}/{conquista.meta}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Secao>
    </div>
  )
}

/** Notas dos últimos simulados entregues, em ordem, com média e tendência. */
function EvolucaoSimulados({
  base,
  entregues,
  className
}: {
  base: string
  entregues: ReturnType<typeof tentativasEntregues>
  className?: string
}) {
  const ultimos = entregues.slice(-8)
  const notas = ultimos.map(({ tentativa }) => tentativa.resultado!.notaFinal)
  const media = notas.length
    ? notas.reduce((soma, nota) => soma + nota, 0) / notas.length
    : 0
  const melhor = notas.length ? Math.max(...notas) : 0
  const anteriores = notas.slice(0, -1)
  const mediaAnterior = anteriores.length
    ? anteriores.reduce((soma, nota) => soma + nota, 0) / anteriores.length
    : null
  const ultima = notas.at(-1)
  const tendencia =
    mediaAnterior !== null && ultima !== undefined ? ultima - mediaAnterior : 0

  return (
    <Secao
      icone={<LuChartColumn />}
      titulo="Evolução nos simulados"
      subtitulo="Nota das últimas tentativas entregues"
      className={className}
      acao={<LinkSecao href={`${base}/simulados`}>Ver simulados</LinkSecao>}
    >
      {ultimos.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Seu primeiro simulado aparece aqui. Cada um vale XP e mostra sua
            evolução.
          </p>
          <LinkBotao
            href={`${base}/simulados/novo`}
            variante="primario"
            tamanho="sm"
          >
            Fazer simulado
          </LinkBotao>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
          <dl className="grid grid-cols-3 gap-2 sm:grid-cols-1">
            <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-inset ring-gray-100">
              <dt className="text-xs font-medium text-gray-500">Média</dt>
              <dd className="text-lg font-bold text-gray-900">
                {formatarNota(media)}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-inset ring-gray-100">
              <dt className="text-xs font-medium text-gray-500">Melhor</dt>
              <dd className="text-lg font-bold text-gray-900">
                {formatarNota(melhor)}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-inset ring-gray-100">
              <dt className="text-xs font-medium text-gray-500">Última</dt>
              <dd className="flex items-center gap-1 text-lg font-bold text-gray-900">
                {formatarNota(ultima ?? 0)}
                {mediaAnterior !== null && Math.abs(tendencia) >= 0.1 && (
                  <span
                    className={clsx(
                      'inline-flex items-center gap-0.5 text-xs font-semibold',
                      tendencia > 0 ? 'text-lime-700' : 'text-red-600'
                    )}
                  >
                    {tendencia > 0 ? (
                      <LuTrendingUp aria-hidden />
                    ) : (
                      <LuTrendingDown aria-hidden />
                    )}
                    {tendencia > 0 ? '+' : ''}
                    {formatarNota(tendencia)}
                    <span className="sr-only">em relação à média anterior</span>
                  </span>
                )}
              </dd>
            </div>
          </dl>

          {/* Uma barra por tentativa; a altura é a nota (0 a 10). */}
          <ol
            className="flex h-44 items-end gap-2 border-b border-gray-200"
            aria-label="Notas dos simulados, da mais antiga para a mais recente"
          >
            {ultimos.map(({ simuladoId, titulo, tentativa }) => {
              const nota = tentativa.resultado!.notaFinal
              return (
                <li key={tentativa.id} className="group relative h-full flex-1">
                  <Link
                    href={`${base}/simulados/${simuladoId}/tentativas/${tentativa.id}/resultado`}
                    className="flex h-full flex-col items-center justify-end gap-1 focus-visible:outline-none"
                  >
                    <span className="text-xs font-semibold text-gray-700">
                      {formatarNota(nota)}
                    </span>
                    <span
                      className={clsx(
                        'w-full max-w-10 rounded-t transition-colors',
                        nota === melhor
                          ? 'bg-xor-navy'
                          : 'bg-xor-navy/40 group-hover:bg-xor-navy/70'
                      )}
                      style={{ height: `${Math.max(3, nota * 10)}%` }}
                    />
                    <span className="sr-only">
                      {titulo}, {formatarDataRelativa(tentativa.entregueEm)}
                    </span>
                  </Link>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-xor-navy px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    {titulo} · {formatarDataRelativa(tentativa.entregueEm)}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </Secao>
  )
}
