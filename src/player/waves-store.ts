import { create } from 'zustand'
import { WAVE_SENSITIVITIES } from './beat-detector'
import type { WaveSensitivity } from './beat-detector'

const STORAGE_KEY = 'legato.waves.v1'

export const MIN_BPM = 30
export const MAX_BPM = 240

export function clampBpm(value: number): number {
  if (!Number.isFinite(value)) {
    return 120
  }
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)))
}

export type SavedWaves = {
  sensitivity: WaveSensitivity
  bpm: number | null
  offsetSeconds: number
}

export function clampOffset(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  const period = 10
  return ((value % period) + period) % period
}

/** Fase media (segundos dentro del compás) de una serie de toques a un BPM. */
export function offsetFromPositions(positions: number[], bpm: number): number {
  if (positions.length === 0 || bpm <= 0) {
    return 0
  }

  const period = 60 / bpm
  let angle = 0
  for (const position of positions) {
    angle += (2 * Math.PI * (position % period)) / period
  }
  angle /= positions.length
  return clampOffset(((angle / (2 * Math.PI)) * period + period) % period)
}

export type TapState = {
  taps: number[]
  bpm: number | null
}

const TAP_TIMEOUT_MS = 2000
const MAX_TAPS = 6

/** Promedio de los últimos toques; se reinicia si pasa mucho tiempo entre uno y otro. */
export function nextTap(current: number[], now: number): TapState {
  const taps =
    current.length > 0 && now - (current[current.length - 1] ?? 0) > TAP_TIMEOUT_MS
      ? []
      : [...current]
  taps.push(now)
  while (taps.length > MAX_TAPS) {
    taps.shift()
  }

  if (taps.length < 2) {
    return { taps, bpm: null }
  }

  let total = 0
  for (let index = 1; index < taps.length; index++) {
    total += (taps[index] ?? 0) - (taps[index - 1] ?? 0)
  }
  const average = total / (taps.length - 1)
  return { taps, bpm: average <= 0 ? null : clampBpm(60_000 / average) }
}

function readSaved(): SavedWaves {
  const fallback: SavedWaves = { sensitivity: 'normal', bpm: null, offsetSeconds: 0 }
  if (typeof localStorage === 'undefined') {
    return fallback
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<SavedWaves>
      const sensitivity =
        typeof parsed.sensitivity === 'string' &&
        (WAVE_SENSITIVITIES as string[]).includes(parsed.sensitivity)
          ? (parsed.sensitivity as WaveSensitivity)
          : 'normal'
      return {
        sensitivity,
        bpm: typeof parsed.bpm === 'number' ? clampBpm(parsed.bpm) : null,
        offsetSeconds:
          typeof parsed.offsetSeconds === 'number' ? clampOffset(parsed.offsetSeconds) : 0,
      }
    }
  } catch {
    // sin persistencia
  }

  return fallback
}

function persist(state: SavedWaves): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // sin persistencia
  }
}

type WavesState = SavedWaves & {
  setSensitivity: (sensitivity: WaveSensitivity) => void
  setBpm: (bpm: number | null) => void
  setOffset: (seconds: number) => void
}

export const useWavesStore = create<WavesState>((set, get) => ({
  ...readSaved(),

  setSensitivity: (sensitivity) => {
    set({ sensitivity })
    persist({ sensitivity, bpm: get().bpm, offsetSeconds: get().offsetSeconds })
  },

  setBpm: (bpm) => {
    const value = bpm === null ? null : clampBpm(bpm)
    set({ bpm: value })
    persist({ sensitivity: get().sensitivity, bpm: value, offsetSeconds: get().offsetSeconds })
  },

  setOffset: (seconds) => {
    const value = clampOffset(seconds)
    set({ offsetSeconds: value })
    persist({ sensitivity: get().sensitivity, bpm: get().bpm, offsetSeconds: value })
  },
}))
