import { create } from 'zustand'

const STORAGE_KEY = 'legato.musician.v1'

function readSaved(): boolean {
  if (typeof localStorage === 'undefined') {
    return false
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      return (JSON.parse(raw) as { enabled?: boolean }).enabled === true
    }
  } catch {
    // sin persistencia
  }

  return false
}

type MusicianState = {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  toggle: () => void
}

export const useMusicianStore = create<MusicianState>((set, get) => ({
  enabled: readSaved(),

  setEnabled: (enabled) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled }))
    } catch {
      // sin persistencia
    }
    set({ enabled })
  },

  toggle: () => get().setEnabled(!get().enabled),
}))
