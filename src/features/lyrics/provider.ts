import { parseLrc, type LyricLine } from './lrc'

export type LyricsQuery = {
  title: string
  artist: string
  album: string | null
  durationSeconds: number | null
}

type LrclibRecord = {
  syncedLyrics?: string | null
  plainLyrics?: string | null
  duration?: number | null
}

const API_GET = 'https://lrclib.net/api/get'
const API_SEARCH = 'https://lrclib.net/api/search'

function queryParams(query: LyricsQuery): URLSearchParams {
  const params = new URLSearchParams({
    track_name: query.title,
    artist_name: query.artist,
  })
  if (query.album !== null && query.album !== '') {
    params.set('album_name', query.album)
  }
  if (query.durationSeconds !== null && query.durationSeconds > 0) {
    params.set('duration', String(Math.round(query.durationSeconds)))
  }
  return params
}

function linesFromRecord(record: LrclibRecord): LyricLine[] | null {
  if (typeof record.syncedLyrics === 'string' && record.syncedLyrics.trim() !== '') {
    const lines = parseLrc(record.syncedLyrics)
    return lines.length > 0 ? lines : null
  }
  return null
}

async function fetchJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) {
    return null
  }
  return response.json()
}

/**
 * Busca letra sincronizada en LRCLIB. Nunca lanza: devuelve null si no hay
 * coincidencia, si el servidor falla o si la petición se aborta.
 */
export async function fetchLyrics(
  query: LyricsQuery,
  signal: AbortSignal,
): Promise<LyricLine[] | null> {
  try {
    const exact = (await fetchJson(
      `${API_GET}?${queryParams(query).toString()}`,
      signal,
    )) as LrclibRecord | null
    const fromExact = exact === null ? null : linesFromRecord(exact)
    if (fromExact !== null) {
      return fromExact
    }

    const searchTerm = [query.title, query.artist].filter((part) => part !== '').join(' ')
    const results = (await fetchJson(
      `${API_SEARCH}?q=${encodeURIComponent(searchTerm)}`,
      signal,
    )) as LrclibRecord[] | null
    if (!Array.isArray(results)) {
      return null
    }

    const expected = query.durationSeconds
    const ordered =
      expected === null
        ? results
        : [
            ...results.filter(
              (record) =>
                typeof record.duration === 'number' && Math.abs(record.duration - expected) <= 5,
            ),
            ...results,
          ]

    for (const record of ordered) {
      const lines = linesFromRecord(record)
      if (lines !== null) {
        return lines
      }
    }

    return null
  } catch {
    return null
  }
}
