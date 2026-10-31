// Tipos mínimos e carregador da YouTube IFrame Player API
// (https://developers.google.com/youtube/iframe_api_reference). Só roda no navegador.
export interface YTPlayer {
  destroy(): void
  cuePlaylist(opcoes: {
    listType: 'playlist'
    list: string
    index?: number
    startSeconds?: number
  }): void
  playVideoAt(indice: number): void
  nextVideo(): void
  previousVideo(): void
  playVideo(): void
  pauseVideo(): void
  seekTo(segundos: number, permitirBusca: boolean): void
  getCurrentTime(): number
  getPlaylist(): string[] | null
  getPlaylistIndex(): number
  getVideoData(): { video_id: string; title: string }
  getPlayerState(): number
  getAvailablePlaybackRates(): number[]
  setPlaybackRate(taxa: number): void
}

interface EventoYT {
  data: number
}

export interface YTNamespace {
  Player: new (
    elemento: HTMLElement,
    opcoes: {
      host?: string
      width?: string
      height?: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: () => void
        onStateChange?: (e: EventoYT) => void
        onError?: (e: EventoYT) => void
      }
    }
  ) => YTPlayer
  PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let carregamento: Promise<YTNamespace> | null = null

export function carregarYT(tempoLimiteMs = 12_000) {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!carregamento) {
    carregamento = new Promise<YTNamespace>((resolve, reject) => {
      const anterior = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        anterior?.()
        if (window.YT) resolve(window.YT)
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.onerror = () => reject(new Error('script bloqueado'))
      document.head.appendChild(script)
      setTimeout(() => reject(new Error('tempo esgotado')), tempoLimiteMs)
    }).catch((erro) => {
      // Permite tentar de novo (ex.: depois de desativar o bloqueador).
      carregamento = null
      throw erro
    })
  }
  return carregamento
}

export function formatarTempo(segundos: number) {
  const total = Math.max(0, Math.floor(segundos))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

export const miniatura = (videoId: string) =>
  `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/mqdefault.jpg`
