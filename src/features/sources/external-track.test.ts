import { describe, expect, it } from 'vitest'
import { isExternalTrack } from './use-external-playback'

describe('isExternalTrack', () => {
  it('detecta referencias de Spotify (marca o URI)', () => {
    expect(isExternalTrack(null)).toBe(false)
    expect(isExternalTrack({ sourceUrl: 'blob:local' })).toBe(false)
    expect(isExternalTrack({ sourceUrl: 'spotify:track:1', external: true })).toBe(true)
    expect(isExternalTrack({ sourceUrl: 'spotify:track:1' })).toBe(true)
  })
})
