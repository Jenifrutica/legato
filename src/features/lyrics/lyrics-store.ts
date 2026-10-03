import { create } from 'zustand'

const STORAGE_KEY = 'legato.lyrics.show'

function readEnabled(): boolean {
  if (typeof localStorage === 'undefined') {
    return true
  }

  try {
    return localStorage.getItem(STORAGE_KEY) !== '0'
  } catch {
    return true
  }
}

type LyricsPrefs = {
  enabled: boolean
  toggle: () => void
  setEnabled: (enabled: boolean) => void
}

export const useLyricsStore = create<LyricsPrefs>((set, get) => ({
  enabled: readEnabled(),

  setEnabled: (enabled) => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
    } catch {
      // sin persistencia
    }
    set({ enabled })
  },

  toggle: () => get().setEnabled(!get().enabled),
}))
