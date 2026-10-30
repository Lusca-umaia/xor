'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ReactNode } from 'react'
import {
  LuArrowRight,
  LuFileText,
  LuLayers,
  LuListChecks,
  LuMessageSquarePlus,
  LuTarget,
  LuTimer,
  LuUpload
} from 'react-icons/lu'
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

function Atalho({
  href,
  icone,
  titulo,
  descricao
}: {
  href: string
  icone: ReactNode
  titulo: string
  descricao: string
}) {
  return (
    <Link
      href={href}
      className={clsx(
        classeCartao,
        'group flex items-start gap-3 p-4 transition-shadow hover:shadow-xl'
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-black text-lg text-white">
        {icone}
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-gray-900">{titulo}</span>
        <span className="block text-xs text-gray-500">{descricao}</span>
      </span>
    </Link>
  )
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

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Atalho
          href={`${base}/materiais`}
          icone={<LuUpload />}
          titulo="Enviar material"
          descricao="PDF, slides, documentos, imagens ou texto"
        />
        <Atalho
          href={`${base}/chats?novo=1`}
          icone={<LuMessageSquarePlus />}
          titulo="Novo chat"
          descricao="Tire dúvidas com base nos materiais"
        />
        <Atalho
          href={`${base}/resumos?novo=1`}
          icone={<LuFileText />}
          titulo="Gerar resumo"
          descricao="Tópicos, texto, glossário ou mapa mental"
        />
        <Atalho
          href={`${base}/atividades?novo=1`}
          icone={<LuListChecks />}
          titulo="Gerar atividade"
          descricao="Quiz, V/F, lacunas, discursiva, flashcards"
        />
        <Atalho
          href={`${base}/simulados/novo`}
          icone={<LuTimer />}
          titulo="Novo simulado"
          descricao="Prova com cronômetro"
        />
      </section>

      {carregando ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          <Esqueleto className="h-48" />
          <Esqueleto className="h-48" />
          <Esqueleto className="h-48" />
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          <section className={clsx(classeCartao, 'p-5 lg:col-span-2')}>
            <h2 className="font-bold text-gray-900">Continuar de onde parou</h2>
            {continuar.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">
                Nada em andamento. Que tal começar enviando um material?
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100">
                {continuar.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-gray-50"
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                        {item.icone}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {item.titulo}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {item.subtitulo} · {formatarDataRelativa(item.quando)}
                        </span>
                      </span>
                      <LuArrowRight className="text-gray-400" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={clsx(classeCartao, 'flex flex-col p-5')}>
            <div className="flex items-center gap-2">
              <LuLayers aria-hidden />
              <h2 className="font-bold text-gray-900">Revisão do dia</h2>
            </div>
            <p className="mt-3 text-4xl font-bold">{pendentes}</p>
            <p className="text-sm text-gray-500">
              flashcard(s) para revisar hoje, segundo a revisão espaçada.
            </p>
            {maisPendente && pendentes > 0 ? (
              <Link
                href={`${base}/atividades/${maisPendente.id}?modo=pendentes`}
                className="mt-auto pt-4 text-sm font-semibold underline"
              >
                Revisar agora
              </Link>
            ) : (
              <Link
                href={`${base}/atividades?novo=1&tipo=FLASHCARDS`}
                className="mt-auto pt-4 text-sm font-semibold underline"
              >
                Criar flashcards
              </Link>
            )}
          </section>

          <section className={clsx(classeCartao, 'p-5 lg:col-span-2')}>
            <h2 className="font-bold text-gray-900">Últimos simulados</h2>
            {tentativasEntregues.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">
                Você ainda não fez simulados neste ambiente.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100">
                {tentativasEntregues
                  .slice(0, 4)
                  .map(({ titulo, simuladoId, tentativa }) => (
                    <li key={tentativa.id}>
                      <Link
                        href={`${base}/simulados/${simuladoId}/tentativas/${tentativa.id}/resultado`}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-gray-50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {titulo}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {formatarDataRelativa(
                              tentativa.entregueEm ?? tentativa.iniciadaEm
                            )}
                          </span>
                        </span>
                        <span className="text-lg font-bold">
                          {formatarNota(tentativa.resultado?.notaFinal ?? 0)}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className={clsx(classeCartao, 'p-5')}>
            <div className="flex items-center gap-2">
              <LuTarget aria-hidden />
              <h2 className="font-bold text-gray-900">Pontos para reforçar</h2>
            </div>
            {topicosFracos.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">
                Faça um simulado para descobrir quais tópicos merecem mais
                atenção.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {topicosFracos.map(({ topico, taxa, total }) => (
                  <li key={topico}>
                    <div className="flex justify-between text-sm">
                      <span className="truncate font-medium">{topico}</span>
                      <span className="text-gray-500">
                        {Math.round(taxa * 100)}%
                      </span>
                    </div>
                    <div
                      className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100"
                      role="meter"
                      aria-valuenow={Math.round(taxa * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Acerto em ${topico}`}
                    >
                      <div
                        className="h-full rounded-full bg-gray-900"
                        style={{ width: `${Math.max(4, taxa * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {total} questão(ões)
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {materiais.data?.length ?? 0} material(is) na biblioteca ·{' '}
        <Link href={`${base}/materiais`} className="underline">
          gerenciar
        </Link>
      </p>
    </div>
  )
}
