import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLocalLyricsStore } from './local-lyrics-store'
import { useLyrics } from './use-lyrics'

beforeEach(() => {
  useLocalLyricsStore.getState().hydrate([])
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useLyrics con letra local', () => {
  it('prefiere la letra local y no llama a LRCLIB', async () => {
    useLocalLyricsStore
      .getState()
      .hydrate([{ trackId: 't1', text: '[00:01.00]Hola\n[00:03.50]Mundo', updatedAt: 1 }])
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useLyrics({
        title: 'Tema',
        artist: 'Alguien',
        album: null,
        durationSeconds: 10,
        trackId: 't1',
      }),
    )

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.source).toBe('local')
    expect(result.current.lines.map((line) => line.text)).toEqual(['Hola', 'Mundo'])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
