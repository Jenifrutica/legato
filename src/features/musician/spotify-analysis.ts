import { chordsFromChromaFrames } from './chord-detect'
import type { DetectedChord } from './chord-detect'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/** Convierte la tonalidad de Spotify (0-11 + modo) al nombre usado en la app. */
export function spotifyKeyName(key: number, mode: number): string | null {
  if (!Number.isInteger(key) || key < 0 || key > 11) {
    return null
  }
  return `${NOTE_NAMES[key] ?? 'C'}${mode === 0 ? 'm' : ''}`
}

/** Acordes a partir de los segmentos cromáticos del análisis de Spotify. */
export function chordsFromSpotifySegments(
  segments: Array<{ start: number; pitches: number[] }>,
): DetectedChord[] {
  return chordsFromChromaFrames(
    segments
      .filter((segment) => segment.pitches.length >= 12)
      .map((segment) => ({ time: segment.start, chroma: segment.pitches })),
  )
}
