import { describe, expect, it } from 'vitest'
import { externalEndAction, isExternalTrack } from './use-external-playback'

describe('isExternalTrack', () => {
  it('detecta referencias de Spotify (marca o URI)', () => {
    expect(isExternalTrack(null)).toBe(false)
    expect(isExternalTrack({ sourceUrl: 'blob:local' })).toBe(false)
    expect(isExternalTrack({ sourceUrl: 'spotify:track:1', external: true })).toBe(true)
    expect(isExternalTrack({ sourceUrl: 'spotify:track:1' })).toBe(true)
  })
})

describe('externalEndAction', () => {
  it('repite la misma pista con «repetir una» y avanza en los demás modos', () => {
    expect(externalEndAction('one')).toBe('repeat')
    expect(externalEndAction('all')).toBe('next')
    expect(externalEndAction('none')).toBe('next')
  })
})
