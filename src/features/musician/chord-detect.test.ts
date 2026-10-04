import { describe, expect, it } from 'vitest'
import {
  activeChordIndex,
  chordFromChroma,
  detectChordsFromSamples,
  majorityChord,
} from './chord-detect'

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

describe('activeChordIndex', () => {
  const events = [
    { time: 0, duration: 2, chord: 'C' },
    { time: 2, duration: 2, chord: 'G' },
    { time: 4, duration: 2, chord: 'Am' },
  ]

  it('encuentra el acorde vigente en cada posición', () => {
    expect(activeChordIndex(events, -1)).toBe(-1)
    expect(activeChordIndex(events, 0.5)).toBe(0)
    expect(activeChordIndex(events, 2)).toBe(1)
    expect(activeChordIndex(events, 3.9)).toBe(1)
    expect(activeChordIndex(events, 100)).toBe(2)
  })

  it('sin acordes devuelve -1', () => {
    expect(activeChordIndex([], 1)).toBe(-1)
  })
})

describe('chordFromChroma', () => {
  it('reconoce un Do mayor claro', () => {
    const chroma = Array.from({ length: 12 }, () => 0)
    chroma[0] = 1
    chroma[4] = 1
    chroma[7] = 1

    expect(chordFromChroma(chroma)).toBe('C')
  })

  it('sin energía no reconoce nada', () => {
    expect(chordFromChroma(Array.from({ length: 12 }, () => 0))).toBeNull()
  })
})

describe('majorityChord', () => {
  it('elige el acorde más repetido ignorando los nulos', () => {
    expect(majorityChord(['C', null, 'C', 'G'])).toBe('C')
    expect(majorityChord([null, null, 'Am'])).toBe('Am')
  })

  it('sin etiquetas devuelve null', () => {
    expect(majorityChord([null, null])).toBeNull()
    expect(majorityChord([])).toBeNull()
  })
})
