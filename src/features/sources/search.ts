import { searchAudius } from './audius'
import { searchJamendo } from './jamendo'
import { searchSpotify } from './spotify'
import type { SourceId, SourceTrack } from './types'

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
    tasks.push(searchAudius(trimmed).catch(() => []))
  }
  if (enabled.jamendo) {
    tasks.push(searchJamendo(trimmed).catch(() => []))
  }
  if (enabled.spotify) {
    tasks.push(searchSpotify(trimmed).catch(() => []))
  }

  const results = await Promise.all(tasks)
  return results.flat()
}
