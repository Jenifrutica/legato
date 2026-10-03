import type { SourceTrack } from './types'

const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID

type JamendoTrack = {
  id: string | number
  name: string
  artist_name: string
  album_name?: string
  duration?: number
  audio?: string
  image?: string
  audiodownload_allowed?: boolean
  shareurl?: string
}

export function isJamendoConfigured(): boolean {
  return typeof CLIENT_ID === 'string' && CLIENT_ID.length > 0
}

export async function searchJamendo(query: string): Promise<SourceTrack[]> {
  if (!isJamendoConfigured()) {
    return []
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    format: 'json',
    limit: '20',
    search: query,
    audioformat: 'mp32',
    include: 'musicinfo',
  })

  const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Jamendo ${response.status}`)
  }

  const data = (await response.json()) as { results: JamendoTrack[] }

  return data.results.map((track) => ({
    id: String(track.id),
    sourceId: 'jamendo',
    title: track.name,
    artist: track.artist_name,
    album: track.album_name ?? null,
    durationSeconds: track.duration ?? null,
    streamUrl: track.audio ?? null,
    artworkUrl: track.image ?? null,
    downloadable: track.audiodownload_allowed === true,
    externalUrl: track.shareurl ?? null,
  }))
}
