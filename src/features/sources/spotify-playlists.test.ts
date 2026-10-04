import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchSpotifyPlaylistTracks,
  fetchSpotifyPlaylists,
  fetchSpotifyTrackPreview,
} from './spotify'

const TOKENS_KEY = 'legato.spotify.tokens'

const trackPayload = {
  id: 't1',
  name: 'Tema',
  artists: [{ name: 'A' }],
  album: { name: 'Alb', images: [{ url: 'http://img' }] },
  duration_ms: 200000,
  preview_url: null,
  external_urls: { spotify: 'https://open.spotify.com/track/t1' },
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response
}

beforeEach(() => {
  localStorage.setItem(
    TOKENS_KEY,
    JSON.stringify({ accessToken: 'test', refreshToken: null, expiresAt: Date.now() + 3_600_000 }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.removeItem(TOKENS_KEY)
})

describe('playlists de Spotify', () => {
  it('resume con tracks.total o items.total', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          items: [
            { id: 'p1', name: 'Una', tracks: { total: 3 }, images: [] },
            { id: 'p2', name: 'Otra', items: { total: 5 }, images: [] },
          ],
        }),
      ),
    )

    const playlists = await fetchSpotifyPlaylists()

    expect(playlists.map((playlist) => playlist.trackCount)).toEqual([3, 5])
  })

  it('baja el límite si la API lo rechaza', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'invalid limit' }, false, 400))
      .mockResolvedValueOnce(
        jsonResponse({ items: [{ id: 'p1', name: 'Una', tracks: { total: 1 } }] }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const playlists = await fetchSpotifyPlaylists()

    expect(playlists).toHaveLength(1)
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('limit=50')
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('limit=20')
  })

  it('lee el campo nuevo item y cae a /items cuando /tracks da 404', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'not found' }, false, 404))
      .mockResolvedValueOnce(jsonResponse({ items: [{ item: trackPayload }], next: null }))
    vi.stubGlobal('fetch', fetchMock)

    const tracks = await fetchSpotifyPlaylistTracks('p1')

    expect(tracks).toHaveLength(1)
    expect(tracks[0]?.externalUrl).toBe('https://open.spotify.com/track/t1')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('lee el preview cuando Spotify lo ofrece', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ preview_url: 'https://p.scdn.co/x.mp3' }))
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchSpotifyTrackPreview('t1')).toBe('https://p.scdn.co/x.mp3')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('market=from_token')
  })

  it('devuelve null cuando no hay preview', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ preview_url: null })))

    expect(await fetchSpotifyTrackPreview('t1')).toBeNull()
  })

  it('ignora pistas locales, nulas o sin id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          items: [
            { track: { ...trackPayload, id: 'ok' } },
            { track: { ...trackPayload, is_local: true } },
            { track: null },
            null,
          ],
          next: null,
        }),
      ),
    )

    const tracks = await fetchSpotifyPlaylistTracks('p1')

    expect(tracks).toHaveLength(1)
    expect(tracks[0]?.id).toBe('ok')
  })
})
