'use client'
import clsx from 'clsx'
import { useState } from 'react'
import { LuPlay, LuTriangleAlert } from 'react-icons/lu'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import { CHAVES } from '@/services/academico/chaves'
import { extrairIdPlaylist } from '@/utils/youtube'
import { Card } from '../../academico/components/Comuns'
import { useArmazenado } from '../../pomodoro/hooks/useArmazenado'
import PlayerPlaylist, { type Playlist } from './PlayerPlaylist'

const campo = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm'

const PlaylistsTab: React.FC = () => {
  const [playlists, setPlaylists] = useArmazenado<Playlist[]>(
    CHAVES.playlists,
    []
  )
  const [link, setLink] = useState('')
  const [titulo, setTitulo] = useState('')
  const [erro, setErro] = useState('')

  const adicionar = (e: React.FormEvent) => {
    e.preventDefault()
    const playlistId = extrairIdPlaylist(link)
    if (!playlistId) {
      setErro(
        'Link inválido. Cole o endereço de uma playlist do YouTube (com "list=...").'
      )
      return
    }
    if (playlists.some((p) => p.playlistId === playlistId)) {
      setErro('Esta playlist já foi adicionada.')
      return
    }
    setPlaylists((l) => [
      ...l,
      {
        id: crypto.randomUUID(),
        playlistId,
        titulo: titulo.trim() || 'Playlist sem título'
      }
    ])
    setLink('')
    setTitulo('')
    setErro('')
  }

  return (
    <div className="space-y-4">
      <div
        role="note"
        className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        <LuTriangleAlert className="mt-0.5 shrink-0" />
        <p>
          <strong>Conteúdo externo:</strong> os vídeos são do YouTube e de seus
          autores. Não são produzidos, revisados nem avalizados pelo XOR ou pela
          UFC, e seguem os termos e a política de privacidade do YouTube.
          Confira a qualidade e a fonte antes de estudar por eles.
        </p>
      </div>

      <Card>
        <h3 className="text-base font-bold tracking-tight">
          Adicionar playlist
        </h3>
        <form onSubmit={adicionar} className="grid gap-2 md:grid-cols-6">
          <input
            aria-label="Link da playlist"
            placeholder="https://www.youtube.com/playlist?list=..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={clsx(campo, 'md:col-span-3')}
          />
          <input
            aria-label="Título (opcional)"
            placeholder="Título (opcional)"
            value={titulo}
            maxLength={80}
            onChange={(e) => setTitulo(e.target.value)}
            className={clsx(campo, 'md:col-span-2')}
          />
          <button
            type="submit"
            disabled={!link.trim()}
            className="cursor-pointer rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Adicionar
          </button>
          {erro && (
            <p role="alert" className="text-sm text-red-600 md:col-span-6">
              {erro}
            </p>
          )}
        </form>
        <p className="text-xs text-gray-500">
          As playlists, o progresso, os vídeos assistidos e as anotações ficam
          salvos só neste navegador. O player usa o domínio
          youtube-nocookie.com.
        </p>
      </Card>

      {playlists.length === 0 ? (
        <EstadoVazio
          icon={<LuPlay />}
          titulo="Nenhuma playlist ainda"
          descricao="Cole o link de uma playlist de estudo do YouTube para assistir aqui, ao lado dos seus outros materiais."
        />
      ) : (
        <div className="space-y-4">
          {playlists.map((p) => (
            <PlayerPlaylist
              key={p.id}
              playlist={p}
              onAtualizar={(patch) =>
                setPlaylists((l) =>
                  l.map((x) => (x.id === p.id ? { ...x, ...patch } : x))
                )
              }
              onRemover={() =>
                setPlaylists((l) => l.filter((x) => x.id !== p.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PlaylistsTab
