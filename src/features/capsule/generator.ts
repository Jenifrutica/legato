import type { LibraryTrack } from '../library'
import type { PlayLog } from './play-log'
import type { CapsuleContext, CapsuleSlide, NostalgiaCapsule } from './types'

const DAY = 86_400_000
const MIN_FRAGMENT_DURATION = 45

function xmur3(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let index = 0; index < seed.length; index++) {
    h = Math.imul(h ^ seed.charCodeAt(index), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return (h ^= h >>> 16) >>> 0
  }
}

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = mulberry32(xmur3(seed)())
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

function contextFor(
  track: LibraryTrack,
  log: PlayLog,
  now: number,
): { context: CapsuleContext; playCount: number } {
  const entry = log[track.id]
  if (entry === undefined) {
    return { context: track.addedAt > now - 14 * DAY ? 'newDiscovery' : 'forgotten', playCount: 0 }
  }
  if (entry.plays >= 2) {
    return { context: 'mostPlayed', playCount: entry.plays }
  }
  if (entry.lastPlayedAt < now - 30 * DAY) {
    return { context: 'forgotten', playCount: entry.plays }
  }
  return {
    context: entry.lastPlayedAt < now - 14 * DAY ? 'forgotten' : 'newDiscovery',
    playCount: entry.plays,
  }
}

function fragmentStart(duration: number): number {
  return Math.max(0, Math.min(30, Math.floor(duration * 0.3)))
}

export function buildCapsule(input: {
  tracks: LibraryTrack[]
  log: PlayLog
  date: string
  userId: string
  now: number
  maxSlides?: number
}): NostalgiaCapsule {
  const { tracks, log, date, userId, now } = input
  const maxSlides = input.maxSlides ?? 5

  const candidates = tracks.filter((track) => (track.durationSeconds ?? 0) > MIN_FRAGMENT_DURATION)
  const playsOf = (track: LibraryTrack) => log[track.id]?.plays ?? 0

  const mostPlayed = [...candidates]
    .filter((track) => playsOf(track) >= 2)
    .sort((a, b) => playsOf(b) - playsOf(a) || b.addedAt - a.addedAt)

  const forgotten = [...candidates]
    .filter((track) => {
      const entry = log[track.id]
      return entry !== undefined && entry.lastPlayedAt < now - 30 * DAY && entry.plays >= 1
    })
    .sort((a, b) => (log[a.id]?.lastPlayedAt ?? 0) - (log[b.id]?.lastPlayedAt ?? 0))

  const yearAgo = [...candidates]
    .filter((track) => track.addedAt < now - 300 * DAY && track.addedAt > now - 430 * DAY)
    .sort((a, b) => a.addedAt - b.addedAt)

  const discovery = [...candidates]
    .filter((track) => track.addedAt > now - 14 * DAY)
    .sort((a, b) => b.addedAt - a.addedAt)

  const chosen: LibraryTrack[] = []
  const seen = new Set<string>()

  const push = (list: LibraryTrack[]) => {
    for (const track of list) {
      if (chosen.length >= maxSlides) {
        return
      }
      if (seen.has(track.id)) {
        continue
      }
      seen.add(track.id)
      chosen.push(track)
    }
  }

  push(mostPlayed)
  push(forgotten)
  push(yearAgo)
  push(discovery)
  push(seededShuffle(candidates, `${date}:${userId}`))

  const slides: CapsuleSlide[] = chosen.map((track) => {
    const duration = track.durationSeconds ?? 0
    const { context, playCount } = contextFor(track, log, now)
    return {
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      artworkUrl: track.artworkUrl,
      startSeconds: fragmentStart(duration),
      context,
      playCount,
      addedAt: track.addedAt,
    }
  })

  const expires = new Date(now)
  expires.setHours(23, 59, 59, 999)

  return { date, userId, expiresAt: expires.getTime(), slides }
}
