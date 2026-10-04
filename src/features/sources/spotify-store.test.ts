import { describe, expect, it } from 'vitest'
import { useSpotifyStore } from './spotify-store'

describe('volumen de Spotify', () => {
  it('guarda el volumen limitado entre 0 y 1', async () => {
    await useSpotifyStore.getState().setVolume(0.4)
    expect(useSpotifyStore.getState().volume).toBeCloseTo(0.4)

    await useSpotifyStore.getState().setVolume(2)
    expect(useSpotifyStore.getState().volume).toBe(1)

    await useSpotifyStore.getState().setVolume(-1)
    expect(useSpotifyStore.getState().volume).toBe(0)
  })
})
