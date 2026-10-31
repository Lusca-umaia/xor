const HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be'
])
// IDs de playlist de usuário (PL), canal (UU), álbum (OL) e favoritos (FL).
// Mixes automáticos (RD...) não podem ser incorporados.
const ID_PLAYLIST = /^(PL|UU|OL|FL)[A-Za-z0-9_-]{8,60}$/

// Aceita o link de uma playlist (ou de um vídeo dentro dela) ou o próprio ID.
export function extrairIdPlaylist(entrada: string) {
  const texto = entrada.trim()
  if (ID_PLAYLIST.test(texto)) return texto
  try {
    const url = new URL(texto)
    if (!HOSTS.has(url.hostname)) return null
    const id = url.searchParams.get('list')
    return id && ID_PLAYLIST.test(id) ? id : null
  } catch {
    return null
  }
}

export const urlPlaylist = (id: string) =>
  `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`
