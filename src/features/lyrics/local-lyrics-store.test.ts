import { beforeEach, describe, expect, it } from 'vitest'
import { useLocalLyricsStore } from './local-lyrics-store'

beforeEach(() => {
  useLocalLyricsStore.getState().hydrate([])
})

describe('store de letra local', () => {
  it('hidrata, guarda y borra la letra por pista', () => {
    useLocalLyricsStore.getState().hydrate([{ trackId: 'a', text: '[00:01.00]Hola', updatedAt: 1 }])
    expect(useLocalLyricsStore.getState().records.a?.text).toBe('[00:01.00]Hola')

    useLocalLyricsStore.getState().setText('b', '[00:02.00]Adiós')
    expect(useLocalLyricsStore.getState().records.b?.text).toBe('[00:02.00]Adiós')

    useLocalLyricsStore.getState().clear('a')
    expect(useLocalLyricsStore.getState().records.a).toBeUndefined()
  })
})
