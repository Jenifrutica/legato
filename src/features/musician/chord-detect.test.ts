import { describe, expect, it } from 'vitest'
import { detectChordsFromSamples } from './chord-detect'

const SAMPLE_RATE = 8192

const CHORD_FREQUENCIES: Record<string, number[]> = {
  C: [261.63, 329.63, 392.0],
  G: [392.0, 493.88, 587.33],
  Am: [440.0, 523.25, 659.26],
  F: [349.23, 440.0, 523.25],
}

function renderChords(sequence: string[], secondsPerChord: number): Float32Array {
  const chordSamples = Math.floor(SAMPLE_RATE * secondsPerChord)
  const samples = new Float32Array(chordSamples * sequence.length)

  sequence.forEach((chord, chordIndex) => {
    const start = chordIndex * chordSamples
    for (const frequency of CHORD_FREQUENCIES[chord] ?? []) {
      for (let index = 0; index < chordSamples; index++) {
        samples[start + index] += 0.3 * Math.sin((2 * Math.PI * frequency * index) / SAMPLE_RATE)
      }
    }
  })

  return samples
}

describe('detectChordsFromSamples', () => {
  it('detecta una progresión C → G con sus tiempos', () => {
    const events = detectChordsFromSamples(renderChords(['C', 'G'], 2), SAMPLE_RATE)

    expect(events.length).toBeGreaterThanOrEqual(2)
    expect(events[0]?.chord).toBe('C')
    expect(events[1]?.chord).toBe('G')
    expect(events[1]?.time).toBeGreaterThan(1.4)
    expect(events[1]?.time).toBeLessThan(2.6)
  })

  it('detecta acordes menores', () => {
    const events = detectChordsFromSamples(renderChords(['Am'], 2), SAMPLE_RATE)

    expect(events[0]?.chord).toBe('Am')
  })

  it('con silencio no devuelve acordes', () => {
    expect(detectChordsFromSamples(new Float32Array(SAMPLE_RATE * 4), SAMPLE_RATE)).toEqual([])
  })

  it('con audio demasiado corto devuelve vacío', () => {
    expect(detectChordsFromSamples(new Float32Array(1000), SAMPLE_RATE)).toEqual([])
  })
})
