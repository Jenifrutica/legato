import { decodeMono } from './audio-decode'
import { fftMagnitudes } from './fft'

export type DetectedChord = {
  time: number
  duration: number
  chord: string
}

const FRAME_SIZE = 4096
const HOP_SIZE = 4096
const MAX_SECONDS = 120
const MIN_CHORD_SECONDS = 0.35
const CHORD_STRENGTH = 0.5
const MIN_FREQUENCY = 65
const MAX_FREQUENCY = 1200

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const MAJOR_TRIAD = [0, 4, 7]
const MINOR_TRIAD = [0, 3, 7]
const UNKNOWN = 'N'

/** Perfil cromático de un cuadro: energía por clase de altura (12). */
function chromaForFrame(
  magnitudes: Float32Array,
  sampleRate: number,
  frameSize: number,
): Float32Array {
  const chroma = new Float32Array(12)
  const binHz = sampleRate / frameSize
  const minBin = Math.max(1, Math.floor(MIN_FREQUENCY / binHz))
  const maxBin = Math.min(magnitudes.length - 1, Math.ceil(MAX_FREQUENCY / binHz))

  for (let bin = minBin; bin <= maxBin; bin++) {
    const frequency = bin * binHz
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440))
    const pitchClass = ((midi % 12) + 12) % 12
    chroma[pitchClass] = (chroma[pitchClass] ?? 0) + (magnitudes[bin] ?? 0)
  }

  let max = 0
  for (const value of chroma) {
    if (value > max) {
      max = value
    }
  }
  if (max <= 1e-9) {
    return chroma
  }

  for (let index = 0; index < chroma.length; index++) {
    chroma[index] = (chroma[index] ?? 0) / max
  }
  return chroma
}

function chordScore(chroma: Float32Array, root: number, triad: number[]): number {
  let score = 0
  for (const interval of triad) {
    score += chroma[(root + interval) % 12] ?? 0
  }
  return score / triad.length
}

function bestChordForFrame(chroma: Float32Array): string {
  let best = UNKNOWN
  let bestScore = 0

  for (let root = 0; root < 12; root++) {
    for (const [triad, suffix] of [
      [MAJOR_TRIAD, ''],
      [MINOR_TRIAD, 'm'],
    ] as const) {
      const score = chordScore(chroma, root, triad)
      if (score > bestScore) {
        bestScore = score
        best = `${NOTE_NAMES[root] ?? 'C'}${suffix}`
      }
    }
  }

  return bestScore >= CHORD_STRENGTH ? best : UNKNOWN
}

function medianFilter(labels: string[], window: number): string[] {
  const half = Math.floor(window / 2)
  return labels.map((_, index) => {
    const values: string[] = []
    for (let offset = -half; offset <= half; offset++) {
      const value = labels[index + offset]
      if (value !== undefined) {
        values.push(value)
      }
    }
    values.sort()
    return values[Math.floor(values.length / 2)] ?? UNKNOWN
  })
}

/**
 * Estima los acordes de un archivo a partir del audio: por cada cuadro calcula
 * el croma (FFT + clases de altura), prueba las 24 tríadas mayores/menores y
 * suaviza el resultado en el tiempo. Puro y testeable.
 */
export function detectChordsFromSamples(
  samples: Float32Array,
  sampleRate: number,
): DetectedChord[] {
  if (sampleRate <= 0 || samples.length < FRAME_SIZE * 2) {
    return []
  }

  const usable = Math.min(samples.length, Math.floor(sampleRate * MAX_SECONDS))
  const frame = new Float32Array(FRAME_SIZE)
  const hopSeconds = HOP_SIZE / sampleRate

  const labels: string[] = []
  for (let start = 0; start + FRAME_SIZE <= usable; start += HOP_SIZE) {
    for (let index = 0; index < FRAME_SIZE; index++) {
      frame[index] = samples[start + index] ?? 0
    }
    const chroma = chromaForFrame(fftMagnitudes(frame), sampleRate, FRAME_SIZE)
    labels.push(bestChordForFrame(chroma))
  }

  if (labels.length === 0) {
    return []
  }

  // Los cuadros sin acorde claro heredan el anterior (los acordes duran compases).
  const filled: string[] = []
  let current = UNKNOWN
  for (const label of labels) {
    if (label !== UNKNOWN) {
      current = label
    }
    filled.push(current)
  }

  const smoothed = medianFilter(filled, 5)
  const events: DetectedChord[] = []

  for (let index = 0; index < smoothed.length; index++) {
    const chord = smoothed[index] ?? UNKNOWN
    if (chord === UNKNOWN) {
      continue
    }
    const time = index * hopSeconds
    const previous = events[events.length - 1]
    if (previous !== undefined && previous.chord === chord) {
      previous.duration = time + hopSeconds - previous.time
    } else {
      events.push({ time, duration: hopSeconds, chord })
    }
  }

  // Funde los acordes demasiado cortos con el anterior.
  const merged: DetectedChord[] = []
  for (const event of events) {
    if (event.duration < MIN_CHORD_SECONDS) {
      const previous = merged[merged.length - 1]
      if (previous !== undefined) {
        previous.duration = event.time + event.duration - previous.time
        continue
      }
    }
    merged.push(event)
  }

  return merged
}

/** Decodifica el blob y estima los acordes (solo navegador). */
export async function detectChordsFromBlob(blob: Blob): Promise<DetectedChord[] | null> {
  const decoded = await decodeMono(blob, MAX_SECONDS)
  if (decoded === null) {
    return null
  }
  return detectChordsFromSamples(decoded.samples, decoded.sampleRate)
}
