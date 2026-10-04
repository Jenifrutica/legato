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
  const fallback: SavedWaves = { sensitivity: 'normal', bpm: null }
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
}

export const useWavesStore = create<WavesState>((set, get) => ({
  ...readSaved(),

  setSensitivity: (sensitivity) => {
    set({ sensitivity })
    persist({ sensitivity, bpm: get().bpm })
  },

  setBpm: (bpm) => {
    const value = bpm === null ? null : clampBpm(bpm)
    set({ bpm: value })
    persist({ sensitivity: get().sensitivity, bpm: value })
  },
}))
