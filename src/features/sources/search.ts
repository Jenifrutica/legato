import { searchAudius } from './audius'
import { searchJamendo } from './jamendo'
import { searchSpotify } from './spotify'
import type { SourceId, SourceTrack } from './types'

const PROVIDER_TIMEOUT_MS = 8000

export type SourceSearchError = {
  sourceId: SourceId
  message: string
}

export type SearchResult = {
  tracks: SourceTrack[]
  errors: SourceSearchError[]
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), PROVIDER_TIMEOUT_MS)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error instanceof Error ? error : new Error('error'))
      },
    )
  })
}

export async function searchAll(
  query: string,
  enabled: Record<SourceId, boolean>,
): Promise<SearchResult> {
  const trimmed = query.trim()
  if (trimmed === '') {
    return { tracks: [], errors: [] }
  }

  const providers: Array<{ id: SourceId; run: () => Promise<SourceTrack[]> }> = []
  if (enabled.audius) {
    providers.push({ id: 'audius', run: () => searchAudius(trimmed) })
  }
  if (enabled.jamendo) {
    providers.push({ id: 'jamendo', run: () => searchJamendo(trimmed) })
  }
  if (enabled.spotify) {
    providers.push({ id: 'spotify', run: () => searchSpotify(trimmed) })
  }

  const settled = await Promise.all(
    providers.map(async (provider) => {
      try {
        const tracks = await withTimeout(provider.run())
        return { id: provider.id, tracks, error: null as string | null }
      } catch (error) {
        return {
          id: provider.id,
          tracks: [] as SourceTrack[],
          error: error instanceof Error ? error.message : 'error',
        }
      }
    }),
  )

  return {
    tracks: settled.flatMap((entry) => entry.tracks),
    errors: settled
      .filter((entry) => entry.error !== null)
      .map((entry) => ({ sourceId: entry.id, message: entry.error as string })),
  }
}
