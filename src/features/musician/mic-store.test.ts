import { describe, expect, it } from 'vitest'
import type { TrackAnalysis } from './analysis-store'
import { shouldSaveMicChords } from './mic-store'

function analysis(patch: Partial<TrackAnalysis>): TrackAnalysis {
  return { trackId: 'a', bpm: null, key: null, updatedAt: 0, ...patch }
}

describe('shouldSaveMicChords', () => {
  it('no guarda con menos de dos acordes', () => {
    expect(shouldSaveMicChords(null, 1)).toBe(false)
  })

  it('guarda si no hay análisis previo o no es de audio local', () => {
    expect(shouldSaveMicChords(null, 3)).toBe(true)
    expect(
      shouldSaveMicChords(
        analysis({
          detectedChords: [{ time: 0, duration: 1, chord: 'C' }],
          detectedChordsSource: 'spotify',
        }),
        3,
      ),
    ).toBe(true)
  })

  it('no pisa un análisis de archivo local', () => {
    expect(
      shouldSaveMicChords(
        analysis({
          detectedChords: [{ time: 0, duration: 1, chord: 'C' }],
          detectedChordsSource: 'audio',
        }),
        3,
      ),
    ).toBe(false)
  })
})
