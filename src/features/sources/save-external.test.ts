import { describe, expect, it } from 'vitest'
import { buildExternalTrack } from './save-track'
import type { SourceTrack } from './types'

const spotifyTrack: SourceTrack = {
  id: 'abc',
  sourceId: 'spotify',
  title: 'Tema',
  artist: 'Artista',
  album: 'Album',
  durationSeconds: 200,
  streamUrl: null,
  artworkUrl: 'https://img/cover.jpg',
  downloadable: false,
  externalUrl: 'spotify:track:abc',
}

describe('referencias externas', () => {
  it('construye una pista de Spotify sin audio propio', () => {
    const track = buildExternalTrack(spotifyTrack)

    expect(track).not.toBeNull()
    expect(track?.external).toBe(true)
    expect(track?.sourceUrl).toBe('spotify:track:abc')
    expect(track?.dedupeKey).toBe('spotify:abc')
    expect(track?.fileSize).toBe(0)
    expect(track?.artworkUrl).toBe('https://img/cover.jpg')
  })

  it('devuelve null si no es Spotify o no hay URL externa', () => {
    expect(buildExternalTrack({ ...spotifyTrack, sourceId: 'audius' })).toBeNull()
    expect(buildExternalTrack({ ...spotifyTrack, externalUrl: null })).toBeNull()
  })
})
