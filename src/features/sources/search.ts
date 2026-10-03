import { searchAudius } from './audius'
import { searchJamendo } from './jamendo'
import { searchSpotify } from './spotify'
import type { SourceId, SourceTrack } from './types'

const PROVIDER_TIMEOUT_MS = 8000

function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), PROVIDER_TIMEOUT_MS)
    }),
  ])
}

export async function searchAll(
  query: string,
  enabled: Record<SourceId, boolean>,
): Promise<SourceTrack[]> {
  const trimmed = query.trim()
  if (trimmed === '') {
    return []
  }

  const tasks: Array<Promise<SourceTrack[]>> = []
  if (enabled.audius) {
    tasks.push(withTimeout(searchAudius(trimmed), []))
  }
  if (enabled.jamendo) {
    tasks.push(withTimeout(searchJamendo(trimmed), []))
  }
  if (enabled.spotify) {
    tasks.push(withTimeout(searchSpotify(trimmed), []))
  }

  const results = await Promise.all(tasks)
  return results.flat()
}
