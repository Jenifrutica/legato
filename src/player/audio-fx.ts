import { create } from 'zustand'
import { AMBIENT_IDS, AmbientEngine, type AmbientId } from './ambient'
import { getAnalyser } from './player-store'

const STORAGE_KEY = 'legato.audiofx'

export type SavedAudioFx = {
  bassDb: number
  ambient: AmbientId | null
  ambientVolume: number
}

const engine = new AmbientEngine()

function clampDb(value: number): number {
  return Math.min(12, Math.max(0, Math.round(value)))
}

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function readSaved(): SavedAudioFx {
  const fallback: SavedAudioFx = { bassDb: 0, ambient: null, ambientVolume: 0.5 }
  if (typeof localStorage === 'undefined') {
    return fallback
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<SavedAudioFx>
      const ambient =
        typeof parsed.ambient === 'string' && (AMBIENT_IDS as string[]).includes(parsed.ambient)
          ? (parsed.ambient as AmbientId)
          : null
      return {
        bassDb: typeof parsed.bassDb === 'number' ? clampDb(parsed.bassDb) : 0,
        ambient,
        ambientVolume:
          typeof parsed.ambientVolume === 'number' ? clampVolume(parsed.ambientVolume) : 0.5,
      }
    }
  } catch {
    // sin persistencia
  }

  return fallback
}

function persist(state: SavedAudioFx): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // sin persistencia
  }
}

type AudioFxState = SavedAudioFx & {
  setBass: (db: number) => void
  setAmbient: (id: AmbientId | null) => void
  setAmbientVolume: (volume: number) => void
}

export const useAudioFxStore = create<AudioFxState>((set, get) => ({
  ...readSaved(),

  setBass: (db) => {
    const bassDb = clampDb(db)
    getAnalyser().setBass(bassDb)
    set({ bassDb })
    persist({ bassDb, ambient: get().ambient, ambientVolume: get().ambientVolume })
  },

  setAmbient: (id) => {
    const context = getAnalyser().audioContext
    if (id === null || context === null) {
      engine.stop()
    } else {
      void context.resume()
      engine.start(context, id, get().ambientVolume)
    }
    set({ ambient: id })
    persist({ bassDb: get().bassDb, ambient: id, ambientVolume: get().ambientVolume })
  },

  setAmbientVolume: (volume) => {
    const ambientVolume = clampVolume(volume)
    engine.setVolume(ambientVolume)
    set({ ambientVolume })
    persist({ bassDb: get().bassDb, ambient: get().ambient, ambientVolume })
  },
}))

// Aplicar lo guardado al arrancar; el contexto queda suspendido hasta el primer gesto.
const initial = useAudioFxStore.getState()
getAnalyser().setBass(initial.bassDb)
if (initial.ambient !== null) {
  const context = getAnalyser().audioContext
  if (context !== null) {
    engine.start(context, initial.ambient, initial.ambientVolume)
  }
}
