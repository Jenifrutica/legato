import type { SourceTrack } from './types'

const APP_NAME = 'Legato'
let hostPromise: Promise<string> | null = null

type AudiusTrack = {
  id: string
  title: string
  duration?: number
  permalink?: string
  user?: { name?: string }
  artwork?: Record<string, string>
}

async function getHost(): Promise<string> {
  hostPromise ??= fetch('https://api.audius.co')
    .then((response) => response.json() as Promise<{ data: string[] }>)
    .then((data) => data.data[0] ?? 'https://discoveryprovider.audius.co')

  return hostPromise
}

export async function searchAudius(query: string): Promise<SourceTrack[]> {
  const host = await getHost()
  const response = await fetch(
    `${host}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${APP_NAME}&limit=20`,
  )

  if (!response.ok) {
    throw new Error(`Audius ${response.status}`)
  }

  const data = (await response.json()) as { data: AudiusTrack[] }

  return data.data.map((track) => ({
    id: track.id,
    sourceId: 'audius',
    title: track.title,
    artist: track.user?.name ?? 'Audius',
    album: null,
    durationSeconds: track.duration ?? null,
    streamUrl: `${host}/v1/tracks/${track.id}/stream?app_name=${APP_NAME}`,
    artworkUrl: track.artwork?.['480x480'] ?? track.artwork?.['150x150'] ?? null,
    downloadable: true,
    externalUrl: track.permalink === undefined ? null : `https://audius.co${track.permalink}`,
  }))
}
