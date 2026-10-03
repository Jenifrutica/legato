import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchLyrics } from './provider'

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response
}

const query = { title: 'Nocturno en Re', artist: 'Trío Ámbar', album: null, durationSeconds: 200 }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('proveedor LRCLIB', () => {
  it('usa la letra sincronizada del endpoint exacto', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ syncedLyrics: '[00:01.00]Hola mundo' }))
    vi.stubGlobal('fetch', fetchMock)

    const lines = await fetchLyrics(query, new AbortController().signal)

    expect(lines).toEqual([{ time: 1, text: 'Hola mundo' }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('cae a la búsqueda si no hay coincidencia exacta', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(null, false))
      .mockResolvedValueOnce(jsonResponse([{ duration: 201, syncedLyrics: '[00:02.00]Búsqueda' }]))
    vi.stubGlobal('fetch', fetchMock)

    const lines = await fetchLyrics(query, new AbortController().signal)

    expect(lines).toEqual([{ time: 2, text: 'Búsqueda' }])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('devuelve null si la red falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    const lines = await fetchLyrics(
      { ...query, durationSeconds: null },
      new AbortController().signal,
    )

    expect(lines).toBeNull()
  })

  it('ignora letras sin sincronía', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ plainLyrics: 'solo texto' })))

    const lines = await fetchLyrics(
      { ...query, durationSeconds: null },
      new AbortController().signal,
    )

    expect(lines).toBeNull()
  })
})
