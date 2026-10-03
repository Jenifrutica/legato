import { describe, expect, it } from 'vitest'
import type { LibraryTrack } from '../library'
import { buildCapsule } from './generator'
import { registerPlay, type PlayLog } from './play-log'

const NOW = new Date('2026-10-03T12:00:00-05:00').getTime()
const DAY = 86_400_000

function track(id: string, overrides: Partial<LibraryTrack> = {}): LibraryTrack {
  return {
    id,
    title: `Título ${id}`,
    artist: 'Artista',
    album: null,
    durationSeconds: 240,
    sourceUrl: `blob:${id}`,
    artworkUrl: null,
    artworkBlob: null,
    blob: new Blob([id]),
    fileName: `${id}.wav`,
    fileSize: 100,
    mimeType: 'audio/wav',
    dedupeKey: id,
    addedAt: NOW - DAY,
    sampleRate: null,
    bitrate: null,
    codec: null,
    channels: null,
    ...overrides,
  }
}

describe('play log', () => {
  it('cuenta reproducciones y conserva el primer registro', () => {
    const first = registerPlay({}, 'a', 1000)
    const second = registerPlay(first, 'a', 2000)

    expect(second.a).toEqual({ plays: 2, firstPlayedAt: 1000, lastPlayedAt: 2000 })
  })
})

describe('cápsula nostálgica', () => {
  it('es determinista para la misma fecha y usuario', () => {
    const tracks = [track('a'), track('b'), track('c'), track('d')]
    const first = buildCapsule({ tracks, log: {}, date: '2026-10-03', userId: 'local', now: NOW })
    const second = buildCapsule({ tracks, log: {}, date: '2026-10-03', userId: 'local', now: NOW })

    expect(first.slides.map((slide) => slide.trackId)).toEqual(
      second.slides.map((slide) => slide.trackId),
    )
  })

  it('prioriza lo más escuchado', () => {
    const log: PlayLog = { b: { plays: 9, firstPlayedAt: 0, lastPlayedAt: NOW - DAY } }
    const capsule = buildCapsule({
      tracks: [track('a'), track('b')],
      log,
      date: '2026-10-03',
      userId: 'local',
      now: NOW,
    })

    expect(capsule.slides[0]?.trackId).toBe('b')
    expect(capsule.slides[0]?.context).toBe('mostPlayed')
    expect(capsule.slides[0]?.playCount).toBe(9)
  })

  it('marca como olvidadas las que llevan más de 30 días sin sonar', () => {
    const log: PlayLog = {
      a: { plays: 1, firstPlayedAt: NOW - 90 * DAY, lastPlayedAt: NOW - 60 * DAY },
    }
    const capsule = buildCapsule({
      tracks: [track('a'), track('b')],
      log,
      date: '2026-10-03',
      userId: 'local',
      now: NOW,
    })

    const forgotten = capsule.slides.find((slide) => slide.trackId === 'a')
    expect(forgotten?.context).toBe('forgotten')
  })

  it('respeta el máximo de tarjetas y descarta fragmentos demasiado cortos', () => {
    const tracks = Array.from({ length: 8 }, (_, index) => track(`t${index}`))
    tracks.push(track('corta', { durationSeconds: 20 }))
    const capsule = buildCapsule({
      tracks,
      log: {},
      date: '2026-10-03',
      userId: 'local',
      now: NOW,
      maxSlides: 5,
    })

    expect(capsule.slides).toHaveLength(5)
    expect(capsule.slides.some((slide) => slide.trackId === 'corta')).toBe(false)
  })

  it('arranca el fragmento entre 0 y 30 segundos', () => {
    const long = buildCapsule({
      tracks: [track('larga', { durationSeconds: 400 })],
      log: {},
      date: '2026-10-03',
      userId: 'local',
      now: NOW,
    })
    const short = buildCapsule({
      tracks: [track('media', { durationSeconds: 60 })],
      log: {},
      date: '2026-10-03',
      userId: 'local',
      now: NOW,
    })

    expect(long.slides[0]?.startSeconds).toBe(30)
    expect(short.slides[0]?.startSeconds).toBe(18)
  })

  it('devuelve una cápsula vacía si no hay biblioteca', () => {
    const capsule = buildCapsule({
      tracks: [],
      log: {},
      date: '2026-10-03',
      userId: 'local',
      now: NOW,
    })

    expect(capsule.slides).toHaveLength(0)
    expect(capsule.expiresAt).toBeGreaterThan(NOW)
  })
})
