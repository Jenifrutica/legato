import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('jamendo source', () => {
  it('mapea resultados y marca descargables', async () => {
    vi.stubEnv('VITE_JAMENDO_CLIENT_ID', 'test-client')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          results: [
            {
              id: 42,
              name: 'Tema',
              artist_name: 'Artista',
              album_name: 'Album',
              duration: 180,
              audio: 'https://jamendo.test/stream',
              image: 'https://jamendo.test/cover.jpg',
              audiodownload_allowed: true,
            },
          ],
        }),
      ),
    )

    const { searchJamendo } = await import('./jamendo')
    const tracks = await searchJamendo('tema')

    expect(tracks).toHaveLength(1)
    expect(tracks[0]).toMatchObject({
      id: '42',
      sourceId: 'jamendo',
      title: 'Tema',
      artist: 'Artista',
      streamUrl: 'https://jamendo.test/stream',
      downloadable: true,
    })
  })

  it('sin client id devuelve vacio', async () => {
    const { searchJamendo } = await import('./jamendo')
    expect(await searchJamendo('x')).toEqual([])
  })
})

describe('audius source', () => {
  it('resuelve host y mapea resultados', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url === 'https://api.audius.co') {
        return Response.json({ data: ['https://host.audius.test'] })
      }
      return Response.json({
        data: [
          {
            id: 'abc',
            title: 'Pista',
            duration: 200,
            permalink: '/artista/pista',
            user: { name: 'Artista Audius' },
            artwork: { '480x480': 'https://audius.test/cover.jpg' },
          },
        ],
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { searchAudius } = await import('./audius')
    const tracks = await searchAudius('pista')

    expect(tracks).toHaveLength(1)
    expect(tracks[0]?.sourceId).toBe('audius')
    expect(tracks[0]?.streamUrl).toContain('https://host.audius.test/v1/tracks/abc/stream')
    expect(tracks[0]?.downloadable).toBe(true)
  })
})
