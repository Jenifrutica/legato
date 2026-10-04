import { beforeEach, describe, expect, it } from 'vitest'
import { isSpotifyConnected, setSpotifyScope } from './spotify'

const tokens = JSON.stringify({ accessToken: 't', refreshToken: 'r', expiresAt: Date.now() + 1000 })

beforeEach(() => {
  localStorage.clear()
  setSpotifyScope(null)
})

describe('ámbito de tokens de Spotify por usuario', () => {
  it('hereda los tokens de una cuenta local anterior', () => {
    localStorage.setItem('legato.spotify.tokens.local-1', tokens)

    setSpotifyScope('firebase-9')

    expect(localStorage.getItem('legato.spotify.tokens.firebase-9')).toBe(tokens)
    expect(localStorage.getItem('legato.spotify.tokens.local-1')).toBeNull()
    expect(isSpotifyConnected()).toBe(true)
  })

  it('no pisa los tokens del usuario actual', () => {
    localStorage.setItem('legato.spotify.tokens.firebase-9', tokens)
    localStorage.setItem('legato.spotify.tokens.local-1', 'otros')

    setSpotifyScope('firebase-9')

    expect(localStorage.getItem('legato.spotify.tokens.local-1')).toBe('otros')
  })
})
