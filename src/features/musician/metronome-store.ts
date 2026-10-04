import { create } from 'zustand'
import { clampBpm, getAnalyser } from '../../player'
import { clampBeatsPerBar, clampClickVolume, MetronomeEngine } from './metronome'
import type { BeatsPerBar } from './metronome'

const STORAGE_KEY = 'legato.metronome.v1'

export type SavedMetronome = {
  bpm: number
  beatsPerBar: BeatsPerBar
  volume: number
}

const FALLBACK: SavedMetronome = { bpm: 120, beatsPerBar: 4, volume: 0.6 }

function readSaved(): SavedMetronome {
  if (typeof localStorage === 'undefined') {
    return FALLBACK
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<SavedMetronome>
      return {
        bpm: typeof parsed.bpm === 'number' ? clampBpm(parsed.bpm) : FALLBACK.bpm,
        beatsPerBar:
          typeof parsed.beatsPerBar === 'number'
            ? clampBeatsPerBar(parsed.beatsPerBar)
            : FALLBACK.beatsPerBar,
        volume:
          typeof parsed.volume === 'number' ? clampClickVolume(parsed.volume) : FALLBACK.volume,
      }
    }
  } catch {
    // sin persistencia
  }

  return FALLBACK
}

function persist(state: SavedMetronome): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // sin persistencia
  }
}

const engine = new MetronomeEngine(() => getAnalyser().audioContext)
const saved = readSaved()
engine.setBpm(saved.bpm)
engine.setBeatsPerBar(saved.beatsPerBar)
engine.setVolume(saved.volume)

type MetronomeState = SavedMetronome & {
  running: boolean
  start: () => void
  stop: () => void
  toggle: () => void
  setBpm: (bpm: number) => void
  setBeatsPerBar: (beats: number) => void
  setVolume: (volume: number) => void
}

export const useMetronomeStore = create<MetronomeState>((set, get) => ({
  ...saved,
  running: false,

  start: () => {
    set({ running: engine.start() })
  },

  stop: () => {
    engine.stop()
    set({ running: false })
  },

  toggle: () => {
    if (get().running) {
      get().stop()
    } else {
      get().start()
    }
  },

  setBpm: (bpm) => {
    const value = clampBpm(bpm)
    engine.setBpm(value)
    set({ bpm: value })
    persist({ bpm: value, beatsPerBar: get().beatsPerBar, volume: get().volume })
  },

  setBeatsPerBar: (beats) => {
    const value = clampBeatsPerBar(beats)
    engine.setBeatsPerBar(value)
    set({ beatsPerBar: value })
    persist({ bpm: get().bpm, beatsPerBar: value, volume: get().volume })
  },

  setVolume: (volume) => {
    const value = clampClickVolume(volume)
    engine.setVolume(value)
    set({ volume: value })
    persist({ bpm: get().bpm, beatsPerBar: get().beatsPerBar, volume: value })
  },
}))
