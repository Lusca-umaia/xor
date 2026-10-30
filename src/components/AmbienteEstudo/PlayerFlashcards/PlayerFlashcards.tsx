'use client'

import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { useState } from 'react'
import { LuLayers, LuRefreshCw } from 'react-icons/lu'
import {
  Atividade,
  AvaliacaoFlashcard,
  Flashcard
} from '@/@types/AmbienteEstudo'
import { chavesAmbiente } from '@/hooks/ambienteEstudo/chavesConsulta'
import { useAtalhosTeclado } from '@/hooks/ambienteEstudo/useAtalhosTeclado'
import { useAvaliarFlashcard } from '@/hooks/ambienteEstudo/useAtividades'
import {
  flashcardPendente,
  rotuloProximoIntervalo
} from '@/utils/ambienteEstudo/revisaoEspacada'
import Botao, { LinkBotao } from '../Botao/Botao'
import BotaoReportar from '../BotaoReportar/BotaoReportar'
import Citacoes from '../Citacoes/Citacoes'
import { classeCartao } from '../estilos'
import Markdown from '../Markdown/Markdown'
import SeloIA from '../SeloIA/SeloIA'

const AVALIACOES: {
  valor: AvaliacaoFlashcard
  rotulo: string
  tecla: string
  classe: string
}[] = [
  {
    valor: 'DE_NOVO',
    rotulo: 'De novo',
    tecla: '1',
    classe: 'ring-red-300 hover:bg-red-50'
  },
  {
    valor: 'DIFICIL',
    rotulo: 'Difícil',
    tecla: '2',
    classe: 'ring-amber-300 hover:bg-amber-50'
  },
  {
    valor: 'BOM',
    rotulo: 'Bom',
    tecla: '3',
    classe: 'ring-green-300 hover:bg-green-50'
  },
  {
    valor: 'FACIL',
    rotulo: 'Fácil',
    tecla: '4',
    classe: 'ring-blue-300 hover:bg-blue-50'
  }
]

type Fase = 'INICIO' | 'ESTUDANDO' | 'FIM'

export default function PlayerFlashcards({
  atividade,
  ambienteId,
  modoInicial
}: {
  atividade: Atividade
  ambienteId: string
  modoInicial?: 'pendentes' | 'todos'
}) {
  const queryClient = useQueryClient()
  const avaliar = useAvaliarFlashcard(atividade.id)

  // Cópia local com o estado de revisão atualizado durante a sessão.
  const [cards, setCards] = useState<Record<string, Flashcard>>(() =>
    Object.fromEntries(atividade.flashcards.map((card) => [card.id, card]))
  )
  const pendentes = atividade.flashcards.filter((card) =>
    flashcardPendente(card)
  )

  const [fase, setFase] = useState<Fase>('INICIO')
  const [fila, setFila] = useState<string[]>([])
  const [virado, setVirado] = useState(false)
  const [contagem, setContagem] = useState<Record<AvaliacaoFlashcard, number>>({
    DE_NOVO: 0,
    DIFICIL: 0,
    BOM: 0,
    FACIL: 0
  })
  const [repetidos, setRepetidos] = useState<Set<string>>(new Set())

  const iniciar = (modo: 'pendentes' | 'todos') => {
    const lista = modo === 'pendentes' ? pendentes : atividade.flashcards
    setFila(lista.map(({ id }) => id))
    setContagem({ DE_NOVO: 0, DIFICIL: 0, BOM: 0, FACIL: 0 })
    setRepetidos(new Set())
    setVirado(false)
    setFase('ESTUDANDO')
  }

  const atual = fila[0] ? cards[fila[0]] : undefined

  const responder = (avaliacao: AvaliacaoFlashcard) => {
    if (!atual || !virado) return
    avaliar.mutate(
      { flashcardId: atual.id, avaliacao },
      {
        onSuccess: (card) =>
          setCards((antigos) => ({ ...antigos, [card.id]: card }))
      }
    )
    setContagem((anterior) => ({
      ...anterior,
      [avaliacao]: anterior[avaliacao] + 1
    }))

    // "De novo" devolve o cartão ao fim da fila uma vez nesta sessão.
    const resto = fila.slice(1)
    const repetir = avaliacao === 'DE_NOVO' && !repetidos.has(atual.id)
    if (repetir) setRepetidos(new Set(repetidos).add(atual.id))
    const proxima = repetir ? [...resto, atual.id] : resto

    setFila(proxima)
    setVirado(false)
    if (proxima.length === 0) {
      setFase('FIM')
      queryClient.invalidateQueries({
        queryKey: chavesAmbiente.atividades(ambienteId)
      })
    }
  }

  useAtalhosTeclado(
    {
      ' ': () => setVirado((valor) => !valor),
      enter: () => setVirado((valor) => !valor),
      ...Object.fromEntries(
        AVALIACOES.map(({ valor, tecla }) => [tecla, () => responder(valor)])
      )
    },
    fase === 'ESTUDANDO'
  )

  if (fase === 'INICIO') {
    const sugerido =
      modoInicial ?? (pendentes.length > 0 ? 'pendentes' : 'todos')
    return (
      <section
        className={clsx(classeCartao, 'mx-auto max-w-xl p-6 text-center')}
      >
        <LuLayers className="mx-auto text-3xl" aria-hidden />
        <h2 className="mt-2 text-2xl font-bold">{atividade.titulo}</h2>
        <p className="mt-2 text-gray-600">
          {atividade.flashcards.length} cartões · {pendentes.length} para
          revisar hoje
        </p>
        <p className="mt-1 text-xs text-gray-500">
          A revisão espaçada mostra cada cartão logo antes de você esquecê-lo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Botao
            variante={sugerido === 'pendentes' ? 'primario' : 'secundario'}
            disabled={pendentes.length === 0}
            onClick={() => iniciar('pendentes')}
          >
            Revisar pendentes ({pendentes.length})
          </Botao>
          <Botao
            variante={sugerido === 'todos' ? 'primario' : 'secundario'}
            onClick={() => iniciar('todos')}
          >
            Estudar todos ({atividade.flashcards.length})
          </Botao>
        </div>
        <p className="mt-4 hidden text-xs text-gray-400 sm:block">
          Atalhos: espaço vira o cartão; 1 a 4 avaliam.
        </p>
      </section>
    )
  }

  if (fase === 'FIM' || !atual) {
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    amanha.setHours(23, 59, 59, 999)
    const voltamAteAmanha = Object.values(cards).filter((card) =>
      flashcardPendente(card, amanha.getTime())
    ).length

    return (
      <section
        className={clsx(classeCartao, 'mx-auto max-w-xl p-6 text-center')}
      >
        <h2 className="text-2xl font-bold">Sessão concluída! 🎉</h2>
        <ul className="mt-4 grid grid-cols-4 gap-2 text-sm">
          {AVALIACOES.map(({ valor, rotulo }) => (
            <li key={valor} className="rounded-lg bg-gray-50 p-2">
              <span className="block text-xl font-bold">{contagem[valor]}</span>
              {rotulo}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-gray-600">
          {voltamAteAmanha > 0
            ? `${voltamAteAmanha} cartão(ões) voltam para revisão até amanhã.`
            : 'Nenhum cartão volta até amanhã. Ótimo trabalho!'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Botao
            icone={<LuRefreshCw aria-hidden />}
            onClick={() => iniciar('todos')}
          >
            Estudar todos de novo
          </Botao>
          <LinkBotao
            href={`/ambientes/${ambienteId}/atividades`}
            variante="primario"
          >
            Voltar às atividades
          </LinkBotao>
        </div>
      </section>
    )
  }

  const total =
    fila.length +
    Object.values(contagem).reduce((soma, valor) => soma + valor, 0)
  const feitos = total - fila.length

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-black transition-all"
            style={{ width: `${(feitos / total) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-600">
          {feitos}/{total}
        </span>
      </div>

      <div className="flashcard-cena">
        <button
          type="button"
          onClick={() => setVirado((valor) => !valor)}
          data-virado={virado}
          aria-label={
            virado ? 'Mostrar a frente do cartão' : 'Mostrar o verso do cartão'
          }
          className="flashcard-corpo relative grid min-h-72 w-full cursor-pointer text-left"
        >
          <div
            className={clsx(
              classeCartao,
              'flashcard-face col-start-1 row-start-1 flex flex-col items-center justify-center p-8 text-center'
            )}
            aria-hidden={virado}
          >
            <span className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Pergunta
            </span>
            <Markdown
              conteudo={atual.frente}
              className="text-xl font-semibold"
            />
            <span className="mt-6 text-xs text-gray-400">
              Clique ou aperte espaço para virar
            </span>
          </div>
          <div
            className="flashcard-face flashcard-verso col-start-1 row-start-1 flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-white shadow-lg"
            aria-hidden={!virado}
          >
            <span className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Resposta
            </span>
            <Markdown conteudo={atual.verso} className="text-lg" />
          </div>
        </button>
      </div>

      {virado ? (
        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-gray-700">
            Quão bem você lembrou?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {AVALIACOES.map(({ valor, rotulo, tecla, classe }) => (
              <button
                key={valor}
                type="button"
                onClick={() => responder(valor)}
                className={clsx(
                  'rounded-xl bg-white px-2 py-3 text-sm font-bold ring-2 transition-colors cursor-pointer',
                  classe
                )}
              >
                {rotulo}
                <span className="block text-xs font-medium text-gray-500">
                  {rotuloProximoIntervalo(atual.revisao, valor)}
                </span>
                <kbd className="hidden text-[10px] text-gray-400 sm:inline">
                  {tecla}
                </kbd>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Citacoes citacoes={atual.citacoes} />
            <SeloIA className="ml-auto" />
            <BotaoReportar alvo={{ tipo: 'FLASHCARD', id: atual.id }} />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Botao variante="primario" onClick={() => setVirado(true)}>
            Mostrar resposta
          </Botao>
        </div>
      )}
    </div>
  )
}
