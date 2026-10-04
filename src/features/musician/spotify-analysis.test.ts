import { describe, expect, it } from 'vitest'
import { chordsFromSpotifySegments, spotifyKeyName } from './spotify-analysis'

function pitches(tones: number[]): number[] {
  return Array.from({ length: 12 }, (_, index) => (tones.includes(index) ? 1 : 0))
}

describe('spotifyKeyName', () => {
  it('convierte el tono y el modo de Spotify', () => {
    expect(spotifyKeyName(9, 0)).toBe('Am')
    expect(spotifyKeyName(0, 1)).toBe('C')
    expect(spotifyKeyName(3, 1)).toBe('D#')
    expect(spotifyKeyName(7, 0)).toBe('Gm')
  })

  it('rechaza valores inválidos', () => {
    expect(spotifyKeyName(-1, 1)).toBeNull()
    expect(spotifyKeyName(12, 1)).toBeNull()
  })
})

describe('chordsFromSpotifySegments', () => {
  it('detecta la secuencia desde el croma por segmentos', () => {
    const chords = chordsFromSpotifySegments([
      { start: 0, pitches: pitches([0, 4, 7]) },
      { start: 0.5, pitches: pitches([0, 4, 7]) },
      { start: 1, pitches: pitches([7, 11, 2]) },
      { start: 1.5, pitches: pitches([7, 11, 2]) },
    ])

    expect(chords[0]?.chord).toBe('C')
    expect(chords[1]?.chord).toBe('G')
    expect(chords[1]?.time).toBeGreaterThanOrEqual(1)
  })

  it('ignora segmentos sin croma', () => {
    expect(chordsFromSpotifySegments([{ start: 0, pitches: [] }])).toEqual([])
    expect(chordsFromSpotifySegments([])).toEqual([])
  })
})
