'use client'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  LuKeyboard,
  LuMaximize,
  LuMinimize,
  LuPause,
  LuPlay,
  LuRotateCcw,
  LuSettings2,
  LuSkipForward,
  LuSparkles,
  LuVolume2
} from 'react-icons/lu'
import Header from '@/components/Header/Header'
import Select from '@/components/Select/Select'
import Skeleton from '@/components/Skeleton/Skeleton'
import { STATUS_KEYS } from '@/components/CourseCard/CourseCard'
import { useProgresso } from '@/hooks/queries/useProgresso'
import { useSessoesFoco } from '@/hooks/queries/useSessoesFoco'
import {
  useExcluirSessaoFoco,
  useRegistrarSessaoFoco
} from '@/hooks/mutations/useSessoesFoco'
import { getErrorMessage } from '@/services/api'
import GraficoSemana from './components/GraficoSemana'
import HistoricoHoje from './components/HistoricoHoje'
import ModalConfiguracoes from './components/ModalConfiguracoes'
import PainelMeta from './components/PainelMeta'
import TempoPorDisciplina from './components/TempoPorDisciplina'
import TimerCircular from './components/TimerCircular'
import {
  CONFIG_PADRAO,
  DICAS_PAUSA,
  formatarDuracao,
  formatarTempo,
  FRASES_FOCO,
  ModoTimer,
  MODOS,
  RUIDOS
} from './consts'
import { useArmazenado } from './hooks/useArmazenado'
import { FocoConcluido, usePomodoro } from './hooks/usePomodoro'
import { resumirSessoes } from './utils/estatisticas'
import { pararRuido, tocarAlerta, tocarRuido } from './utils/som'

// 0 = estudo livre, sem disciplina.
const SEM_DISCIPLINA = 0

const ORDEM_MODOS: ModoTimer[] = ['FOCO', 'PAUSA_CURTA', 'PAUSA_LONGA']

const ATALHOS = [
  { tecla: 'Espaço', acao: 'iniciar/pausar' },
  { tecla: 'R', acao: 'reiniciar' },
  { tecla: 'S', acao: 'pular' },
  { tecla: 'F', acao: 'tela cheia' }
]

function notificar(titulo: string, corpo: string) {
  if (
    typeof Notification === 'undefined' ||
    Notification.permission !== 'granted' ||
    !document.hidden
  ) {
    return
  }
  new Notification(titulo, { body: corpo, icon: '/simple_logo.png' })
}

const Pomodoro = () => {
  const { data: progresso, isLoading: carregandoProgresso } = useProgresso()
  const { data: sessoes, isLoading: carregandoSessoes } = useSessoesFoco()
  const registrar = useRegistrarSessaoFoco()
  const excluir = useExcluirSessaoFoco()

  const [config, setConfig] = useArmazenado(
    'xor:pomodoro:config',
    CONFIG_PADRAO
  )
  const [sessao, setSessao] = useArmazenado('xor:pomodoro:sessao', {
    disciplinaId: SEM_DISCIPLINA,
    tarefa: ''
  })
  const [configAberta, setConfigAberta] = useState(false)
  const [telaCheia, setTelaCheia] = useState(false)
  const [aviso, setAviso] = useState<string>()
  const cardRef = useRef<HTMLElement>(null)

  const disciplinas = useMemo(() => progresso?.disciplinas ?? [], [progresso])
  const opcoesDisciplina = useMemo(
    () => [
      { id: SEM_DISCIPLINA, nome: 'Estudo livre' },
      ...disciplinas
        .filter(({ status }) => status === STATUS_KEYS.ANDAMENTO)
        .map(({ id, nome }) => ({ id, nome }))
    ],
    [disciplinas]
  )
  // Enquanto o progresso carrega, mantém a escolha salva (um foco concluído
  // fora da página é registrado logo ao abrir).
  const disciplinaId =
    !progresso || opcoesDisciplina.some(({ id }) => id === sessao.disciplinaId)
      ? sessao.disciplinaId
      : SEM_DISCIPLINA

  const nomeDisciplina = useCallback(
    (id: number | null) =>
      disciplinas.find((d) => d.id === id)?.nome ?? 'Estudo livre',
    [disciplinas]
  )

  const resumo = useMemo(() => resumirSessoes(sessoes ?? []), [sessoes])

  const onFocoConcluido = (foco: FocoConcluido) => {
    const bateuMeta =
      sessoes !== undefined && resumo.hoje.pomodoros + 1 === config.metaDiaria

    registrar.mutate(
      {
        ...foco,
        disciplinaId: disciplinaId || null,
        tarefa: sessao.tarefa
      },
      {
        onSuccess: () =>
          setAviso(
            bateuMeta
              ? `Meta do dia alcançada! ${config.metaDiaria} pomodoros concluídos.`
              : `Pomodoro concluído! +${formatarDuracao(foco.duracaoSegundos)} de foco.`
          ),
        onError: (error) =>
          setAviso(
            getErrorMessage(error, 'Não foi possível salvar a sessão de foco')
          )
      }
    )
  }

  const onBlocoConcluido = (modo: ModoTimer, proximo: ModoTimer) => {
    if (config.som) tocarAlerta()
    if (config.notificacoes) {
      if (modo === 'FOCO') {
        notificar(
          'Pomodoro concluído!',
          `Hora da ${MODOS[proximo].label.toLowerCase()}. Você merece.`
        )
      } else {
        notificar('Pausa encerrada', 'Bora voltar ao foco?')
      }
    }
  }

  const timer = usePomodoro({ config, onFocoConcluido, onBlocoConcluido })
  const { modo, restante, rodando } = timer
  const visual = MODOS[modo]

  // Sair do foco no meio descarta o tempo, então pede confirmação.
  const podeDescartar = () =>
    !(modo === 'FOCO' && timer.emAndamento) ||
    window.confirm(
      'Este pomodoro ainda não terminou e não será contado. Continuar?'
    )

  const trocarModo = (novo: ModoTimer) => {
    if (novo !== modo && podeDescartar()) timer.trocarModo(novo)
  }

  const reiniciar = () => {
    if (podeDescartar()) timer.reiniciar()
  }

  const pular = () => {
    if (podeDescartar()) timer.pular()
  }

  const alternarTelaCheia = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void cardRef.current?.requestFullscreen?.()
    }
  }, [])

  useEffect(() => {
    const aoMudar = () => setTelaCheia(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', aoMudar)
    return () => document.removeEventListener('fullscreenchange', aoMudar)
  }, [])

  // Tempo restante no título da aba.
  useEffect(() => {
    const original = document.title
    return () => {
      document.title = original
    }
  }, [])

  const tituloAba = rodando
    ? `${formatarTempo(restante)} · ${visual.label} | XOR`
    : null
  useEffect(() => {
    if (tituloAba) document.title = tituloAba
  }, [tituloAba])

  // Som ambiente só durante o foco.
  useEffect(() => {
    if (rodando && modo === 'FOCO') {
      tocarRuido(config.ruido, config.volumeRuido)
    } else {
      pararRuido()
    }
  }, [rodando, modo, config.ruido, config.volumeRuido])

  useEffect(() => pararRuido, [])

  useEffect(() => {
    if (!aviso) return
    const id = setTimeout(() => setAviso(undefined), 5000)
    return () => clearTimeout(id)
  }, [aviso])

  // Atalhos de teclado.
  const acoes = useRef({ alternar: timer.alternar, reiniciar, pular })
  useEffect(() => {
    acoes.current = { alternar: timer.alternar, reiniciar, pular }
  })

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || configAberta) return
      const alvo = e.target as HTMLElement
      if (alvo.closest('input, textarea, select, [contenteditable="true"]')) {
        return
      }

      const tecla = e.key.toLowerCase()
      if (tecla === ' ') {
        // Em botões e listas o espaço já tem ação própria.
        if (alvo.closest('button, a, [role]')) return
        e.preventDefault()
        acoes.current.alternar()
      } else if (tecla === 'r') {
        acoes.current.reiniciar()
      } else if (tecla === 's') {
        acoes.current.pular()
      } else if (tecla === 'f') {
        alternarTelaCheia()
      }
    }

    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [configAberta, alternarTelaCheia])

  const primeiroNome = progresso?.aluno.nome.split(' ')[0]
  const dica =
    DICAS_PAUSA[(resumo.hoje.pomodoros + timer.ciclo) % DICAS_PAUSA.length]
  const frase = FRASES_FOCO[resumo.hoje.pomodoros % FRASES_FOCO.length]

  return (
    <div>
      {carregandoProgresso ? (
        <div className="mb-4 space-y-2">
          <Skeleton className="h-8 w-80 max-w-full" />
          <Skeleton className="h-4 w-[32rem] max-w-full" />
        </div>
      ) : (
        <Header
          title={
            primeiroNome ? `Hora de focar, ${primeiroNome}!` : 'Hora de focar!'
          }
          description="Escolha o que vai estudar, solte o timer e deixe as distrações para a pausa."
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 items-start gap-4">
        <section
          ref={cardRef}
          className={clsx(
            'xl:col-span-2 bg-white border border-gray-100 shadow-lg space-y-6',
            telaCheia
              ? 'flex flex-col justify-center overflow-y-auto p-8 max-md:p-4'
              : 'rounded-2xl p-6 max-md:p-4'
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="grid flex-1 grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 max-w-md">
              {ORDEM_MODOS.map((item) => {
                const { curto, icon: Icon } = MODOS[item]
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => trocarModo(item)}
                    className={clsx(
                      'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
                      item === modo
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    <Icon className="max-sm:hidden" />
                    {curto}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={alternarTelaCheia}
                className="cursor-pointer rounded-lg p-2 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label={
                  telaCheia ? 'Sair da tela cheia' : 'Modo tela cheia'
                }
                title={telaCheia ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
              >
                {telaCheia ? <LuMinimize /> : <LuMaximize />}
              </button>
              <button
                type="button"
                onClick={() => {
                  // O modal abre fora do card, invisível em tela cheia.
                  if (document.fullscreenElement) void document.exitFullscreen()
                  setConfigAberta(true)
                }}
                className="cursor-pointer rounded-lg p-2 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Configurações"
                title="Configurações"
              >
                <LuSettings2 />
              </button>
            </div>
          </div>

          <div
            className={clsx(
              'rounded-2xl py-6 px-4 transition-colors duration-500',
              visual.fundo
            )}
          >
            <TimerCircular
              modo={modo}
              restante={restante}
              total={timer.total}
              rodando={rodando}
              ciclo={timer.ciclo}
              ciclosAtePausaLonga={config.ciclosAtePausaLonga}
              className={telaCheia ? 'max-w-[28rem]' : 'max-w-[20rem]'}
            />
            <p className="mt-3 text-center text-sm font-medium text-gray-500">
              {modo === 'FOCO'
                ? frase
                : `Pomodoro ${timer.ciclo} de ${config.ciclosAtePausaLonga} do ciclo concluído.`}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={reiniciar}
              className="cursor-pointer rounded-full p-3.5 text-xl text-gray-600 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 hover:text-gray-900"
              aria-label="Reiniciar"
              title="Reiniciar (R)"
            >
              <LuRotateCcw />
            </button>
            <button
              type="button"
              onClick={timer.alternar}
              disabled={!timer.carregado}
              className={clsx(
                'flex min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition active:scale-95 disabled:opacity-60',
                visual.botao
              )}
            >
              {rodando ? (
                <LuPause className="text-xl" />
              ) : (
                <LuPlay className="text-xl" />
              )}
              {rodando ? 'Pausar' : timer.emAndamento ? 'Continuar' : 'Iniciar'}
            </button>
            <button
              type="button"
              onClick={pular}
              className="cursor-pointer rounded-full p-3.5 text-xl text-gray-600 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 hover:text-gray-900"
              aria-label="Pular bloco"
              title="Pular (S)"
            >
              <LuSkipForward />
            </button>
          </div>

          {modo === 'FOCO' && telaCheia ? (
            // Os selects abrem fora do card, então em tela cheia só o resumo.
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-gray-900">
                {sessao.tarefa || 'Sessão de foco'}
              </p>
              <p className="text-sm text-gray-500">
                {nomeDisciplina(disciplinaId || null)}
              </p>
            </div>
          ) : modo === 'FOCO' ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Select
                className="md:col-span-2"
                label="Disciplina"
                options={opcoesDisciplina}
                value={disciplinaId}
                disabled={carregandoProgresso}
                onChange={({ id }) =>
                  setSessao((s) => ({ ...s, disciplinaId: id }))
                }
              />
              <div className="md:col-span-3">
                <label
                  htmlFor="tarefa"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  No que você vai focar agora?
                </label>
                <input
                  id="tarefa"
                  type="text"
                  maxLength={200}
                  value={sessao.tarefa}
                  onChange={(e) =>
                    setSessao((s) => ({ ...s, tarefa: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                      if (!rodando) timer.alternar()
                    }
                  }}
                  placeholder="Ex.: resolver a lista 3 de Cálculo"
                  className="mt-1 block w-full rounded-md border-0 p-1.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-xor-navy"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <LuSparkles
                className={clsx('mt-0.5 shrink-0 text-lg', visual.texto)}
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">
                  Sugestão para a pausa
                </p>
                <p className="text-sm text-gray-600">{dica}</p>
                {sessao.tarefa && (
                  <p className="text-xs text-gray-400">
                    Na volta: {sessao.tarefa}
                  </p>
                )}
              </div>
            </div>
          )}

          <div
            className={clsx(
              'flex flex-wrap items-end justify-between gap-4 border-t border-gray-100 pt-4',
              telaCheia && 'hidden'
            )}
          >
            <div className="flex flex-wrap items-end gap-3">
              <Select
                className="w-64 max-sm:w-full"
                label="Som ambiente no foco"
                options={RUIDOS}
                value={config.ruido}
                onChange={({ id }) => setConfig((c) => ({ ...c, ruido: id }))}
              />
              {config.ruido !== 'NENHUM' && (
                <label className="flex items-center gap-2 pb-2 text-gray-500">
                  <LuVolume2 aria-hidden="true" />
                  <span className="sr-only">Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={config.volumeRuido}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        volumeRuido: Number(e.target.value)
                      }))
                    }
                    className="w-28 accent-xor-navy"
                  />
                </label>
              )}
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 max-md:hidden">
              <LuKeyboard className="text-sm" />
              {ATALHOS.map(({ tecla, acao }) => (
                <span key={tecla}>
                  <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans font-semibold text-gray-500">
                    {tecla}
                  </kbd>{' '}
                  {acao}
                </span>
              ))}
            </p>
          </div>

          {/* Dentro do card para aparecer também em tela cheia. */}
          {aviso && (
            <div
              role="status"
              className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-xl max-md:w-[calc(100%-2rem)]"
            >
              {aviso}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <PainelMeta
            resumo={resumo}
            metaDiaria={config.metaDiaria}
            minutosFoco={config.foco}
            carregando={carregandoSessoes}
          />
          <GraficoSemana
            dias={resumo.ultimos7Dias}
            metaMinutos={config.metaDiaria * config.foco}
          />
          <TempoPorDisciplina
            itens={resumo.porDisciplina}
            nomeDisciplina={nomeDisciplina}
          />
          <HistoricoHoje
            sessoes={resumo.sessoesHoje}
            nomeDisciplina={nomeDisciplina}
            excluindo={excluir.isPending}
            onExcluir={(id) =>
              excluir.mutate(id, {
                onError: (error) =>
                  setAviso(getErrorMessage(error, 'Não foi possível remover'))
              })
            }
          />
        </aside>
      </div>

      <ModalConfiguracoes
        open={configAberta}
        config={config}
        onClose={() => setConfigAberta(false)}
        onSalvar={setConfig}
      />
    </div>
  )
}

export default Pomodoro
