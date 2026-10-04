import { beforeEach, describe, expect, it } from 'vitest'
import { usePlayLogStore } from './play-log'

beforeEach(() => {
  localStorage.clear()
  usePlayLogStore.getState().setScope(null)
})

describe('ámbito del registro de escuchas por usuario', () => {
  it('hereda las escuchas de una cuenta local anterior', () => {
    localStorage.setItem(
      'legato.plays.v1.local-1',
      JSON.stringify({ a: { plays: 2, firstPlayedAt: 1, lastPlayedAt: 2 } }),
    )

    usePlayLogStore.getState().setScope('firebase-9')

    expect(usePlayLogStore.getState().log.a?.plays).toBe(2)
    expect(localStorage.getItem('legato.plays.v1.local-1')).toBeNull()
  })
})
