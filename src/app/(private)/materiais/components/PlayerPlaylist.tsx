'use client'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import {
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuExternalLink,
  LuNotebookPen,
  LuTrash2
} from 'react-icons/lu'
import {
  type YTPlayer,
  carregarYT,
  formatarTempo,
  miniatura
} from '@/utils/youtube/api'
import { urlPlaylist } from '@/utils/youtube'
import { Card } from '../../academico/components/Comuns'

export interface NotaVideo {
  id: string
  videoId: string
  segundos: number
  texto: string
}

// Os campos além de `titulo` são preenchidos pelo player; playlists salvas antes
// não os têm.
export interface Playlist {
  id: string
  playlistId: string
  titulo: string
  indice?: number
  segundos?: number
  assistidos?: string[]
  videos?: string[]
  titulos?: Record<string, string>
  notas?: NotaVideo[]
}

interface Props {
  playlist: Playlist
  onAtualizar: (patch: Partial<Playlist>) => void
  onRemover: () => void
}

const SALVAR_A_CADA_MS = 5000

const MENSAGEM_ERRO: Record<number, string> = {
  2: 'Link de vídeo inválido.',
  5: 'O navegador não conseguiu reproduzir este vídeo.',
  100: 'Vídeo removido ou privado.',
  101: 'O dono do vídeo não permite exibi-lo fora do YouTube.',
  150: 'O dono do vídeo não permite exibi-lo fora do YouTube.'
}

const PlayerPlaylist: React.FC<Props> = ({
  playlist,
  onAtualizar,
  onRemover
}) => {
  const alvo = useRef<HTMLDivElement>(null)
  const player = useRef<YTPlayer | null>(null)
  // Segundos a buscar assim que o vídeo escolhido começar a tocar.
  const buscaPendente = useRef<number | null>(null)
  // Estado e callback mais recentes, para os eventos do player não ficarem obsoletos.
  const ultimo = useRef({ playlist, onAtualizar })
  useEffect(() => {
    ultimo.current = { playlist, onAtualizar }
  })

  const [bloqueio, setBloqueio] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [indice, setIndice] = useState(playlist.indice ?? 0)
  const [videoId, setVideoId] = useState('')
  const [taxa, setTaxa] = useState(1)
  const [taxas, setTaxas] = useState<number[]>([1])
  const [pronto, setPronto] = useState(false)
  const [textoNota, setTextoNota] = useState('')

  const videos = playlist.videos ?? []
  const assistidos = new Set(playlist.assistidos ?? [])
  const nAssistidos = videos.filter((v) => assistidos.has(v)).length
  const titulos = playlist.titulos ?? {}
  const nomeDe = (id: string, i: number) => titulos[id] ?? `Vídeo ${i + 1}`

  useEffect(() => {
    let encerrado = false
    let intervalo: ReturnType<typeof setInterval> | undefined
    const elemento = document.createElement('div')
    alvo.current?.appendChild(elemento)

    // Lê o estado do player e guarda no que mudou (lista, título e posição).
    const sincronizar = (p: YTPlayer) => {
      const { playlist: atual, onAtualizar: atualizar } = ultimo.current
      const dados = p.getVideoData()
      const lista = p.getPlaylist() ?? []
      const posicao = p.getPlaylistIndex()
      setIndice(posicao)
      setVideoId(dados?.video_id ?? '')
      const patch: Partial<Playlist> = {}
      if (lista.length && lista.join() !== (atual.videos ?? []).join())
        patch.videos = lista
      if (
        dados?.video_id &&
        dados.title &&
        atual.titulos?.[dados.video_id] !== dados.title
      )
        patch.titulos = { ...atual.titulos, [dados.video_id]: dados.title }
      if (Object.keys(patch).length) atualizar(patch)
    }

    carregarYT()
      .then((YT) => {
        if (encerrado) return
        const p = new YT.Player(elemento, {
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: { rel: 0, playsinline: 1 },
          events: {
            onReady: () => {
              const { playlist: salvo } = ultimo.current
              p.cuePlaylist({
                listType: 'playlist',
                list: salvo.playlistId,
                index: salvo.indice ?? 0,
                startSeconds: salvo.segundos ?? 0
              })
              setTaxas(p.getAvailablePlaybackRates())
              setPronto(true)
            },
            onStateChange: ({ data }) => {
              sincronizar(p)
              setAviso(null)
              if (data === YT.PlayerState.ENDED) {
                const id = p.getVideoData()?.video_id
                const { playlist: atual, onAtualizar: atualizar } =
                  ultimo.current
                if (id && !(atual.assistidos ?? []).includes(id))
                  atualizar({ assistidos: [...(atual.assistidos ?? []), id] })
              }
              if (
                data === YT.PlayerState.PLAYING &&
                buscaPendente.current !== null
              ) {
                p.seekTo(buscaPendente.current, true)
                buscaPendente.current = null
              }
            },
            onError: ({ data }) =>
              setAviso(
                MENSAGEM_ERRO[data] ?? `Erro do player (código ${data}).`
              )
          }
        })
        player.current = p
        intervalo = setInterval(() => {
          if (p.getPlayerState?.() !== YT.PlayerState.PLAYING) return
          const posicao = Math.floor(p.getCurrentTime())
          const { playlist: atual, onAtualizar: atualizar } = ultimo.current
          const idx = p.getPlaylistIndex()
          if (idx !== atual.indice || posicao !== atual.segundos)
            atualizar({ indice: idx, segundos: posicao })
        }, SALVAR_A_CADA_MS)
      })
      .catch(() =>
        setBloqueio(
          'Não foi possível carregar o player do YouTube. Verifique a conexão ou desative o bloqueador de anúncios para este site.'
        )
      )

    return () => {
      encerrado = true
      if (intervalo) clearInterval(intervalo)
      try {
        player.current?.destroy()
      } catch {
        // Player já removido.
      }
      player.current = null
      elemento.remove()
    }
  }, [playlist.playlistId])

  const ir = (nota: NotaVideo) => {
    const p = player.current
    if (!p) return
    const i = videos.indexOf(nota.videoId)
    if (i === indice || i === -1) {
      p.seekTo(nota.segundos, true)
      p.playVideo()
    } else {
      buscaPendente.current = nota.segundos
      p.playVideoAt(i)
    }
  }

  const anotar = (e: React.FormEvent) => {
    e.preventDefault()
    const p = player.current
    if (!p || !textoNota.trim() || !videoId) return
    onAtualizar({
      notas: [
        ...(playlist.notas ?? []),
        {
          id: crypto.randomUUID(),
          videoId,
          segundos: Math.floor(p.getCurrentTime()),
          texto: textoNota.trim()
        }
      ]
    })
    setTextoNota('')
  }

  const alternarAssistido = (id: string) =>
    onAtualizar({
      assistidos: assistidos.has(id)
        ? [...assistidos].filter((v) => v !== id)
        : [...assistidos, id]
    })

  const notas = playlist.notas ?? []

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-bold leading-tight">{playlist.titulo}</h4>
          {videos.length > 0 && (
            <p className="text-xs text-gray-500">
              {nAssistidos} de {videos.length} vídeos assistidos
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-gray-400">
          <a
            href={urlPlaylist(playlist.playlistId)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${playlist.titulo} no YouTube`}
            className="hover:text-xor-navy"
          >
            <LuExternalLink />
          </a>
          <button
            type="button"
            aria-label={`Remover ${playlist.titulo}`}
            onClick={onRemover}
            className="cursor-pointer hover:text-red-600"
          >
            <LuTrash2 />
          </button>
        </div>
      </div>

      {videos.length > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-xor-lime"
            style={{ width: `${(nAssistidos / videos.length) * 100}%` }}
          />
        </div>
      )}

      {bloqueio ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {bloqueio}
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-3">
            <div
              ref={alvo}
              className="aspect-video overflow-hidden rounded-xl bg-gray-100 [&_iframe]:size-full"
            />
            {aviso && (
              <p role="status" className="text-sm text-amber-700">
                {aviso} O player segue para o próximo vídeo quando possível.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!pronto}
                onClick={() => player.current?.previousVideo()}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:opacity-50"
              >
                <LuChevronLeft /> Anterior
              </button>
              <button
                type="button"
                disabled={!pronto}
                onClick={() => player.current?.nextVideo()}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:opacity-50"
              >
                Próximo <LuChevronRight />
              </button>
              <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                Velocidade
                <select
                  value={taxa}
                  disabled={!pronto}
                  onChange={(e) => {
                    const nova = Number(e.target.value)
                    setTaxa(nova)
                    player.current?.setPlaybackRate(nova)
                  }}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                  {taxas.map((t) => (
                    <option key={t} value={t}>
                      {t}x
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <form onSubmit={anotar} className="flex gap-2">
              <input
                aria-label="Anotação neste momento do vídeo"
                placeholder="Anotar neste momento do vídeo"
                value={textoNota}
                maxLength={300}
                onChange={(e) => setTextoNota(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                disabled={!pronto || !textoNota.trim() || !videoId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LuNotebookPen /> Anotar
              </button>
            </form>
          </div>

          <ol
            aria-label="Vídeos da playlist"
            className="max-h-[26rem] space-y-1 overflow-y-auto rounded-xl border border-gray-100 p-1"
          >
            {videos.length === 0 && (
              <li className="p-3 text-sm text-gray-500">
                A lista de vídeos aparece quando você der o play.
              </li>
            )}
            {videos.map((id, i) => (
              <li
                key={id}
                className={clsx(
                  'flex items-center gap-2 rounded-lg p-1',
                  i === indice && 'bg-xor-navy/5'
                )}
              >
                <button
                  type="button"
                  onClick={() => player.current?.playVideoAt(i)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                >
                  {}
                  <img
                    src={miniatura(id)}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-10 w-[4.5rem] shrink-0 rounded object-cover"
                  />
                  <span
                    className={clsx(
                      'line-clamp-2 text-xs leading-tight',
                      i === indice ? 'font-bold' : 'text-gray-700'
                    )}
                  >
                    {i + 1}. {nomeDe(id, i)}
                  </span>
                </button>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={assistidos.has(id)}
                  aria-label={`Marcar "${nomeDe(id, i)}" como assistido`}
                  onClick={() => alternarAssistido(id)}
                  className={clsx(
                    'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded border text-xs',
                    assistidos.has(id)
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 text-transparent hover:border-gray-400'
                  )}
                >
                  <LuCheck />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {notas.length > 0 && (
        <ul className="divide-y divide-gray-100 border-t border-gray-100 pt-2 text-sm">
          {notas.map((n) => {
            const i = videos.indexOf(n.videoId)
            return (
              <li key={n.id} className="flex items-start gap-2 py-1.5">
                <button
                  type="button"
                  onClick={() => ir(n)}
                  className="shrink-0 cursor-pointer rounded bg-xor-navy/5 px-1.5 py-0.5 text-xs font-bold text-xor-navy hover:bg-xor-navy/10"
                  title="Ir para este momento"
                >
                  {formatarTempo(n.segundos)}
                </button>
                <p className="min-w-0 flex-1 text-gray-700">
                  {n.texto}
                  <span className="block text-xs text-gray-400">
                    {i >= 0 ? nomeDe(n.videoId, i) : 'Vídeo da playlist'}
                  </span>
                </p>
                <button
                  type="button"
                  aria-label="Remover anotação"
                  onClick={() =>
                    onAtualizar({ notas: notas.filter((x) => x.id !== n.id) })
                  }
                  className="cursor-pointer text-gray-400 hover:text-red-600"
                >
                  <LuTrash2 />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default PlayerPlaylist
