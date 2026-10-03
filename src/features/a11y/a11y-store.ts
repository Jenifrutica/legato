import { create } from 'zustand'
import { DEFAULT_A11Y_PREFERENCES } from './types'
import type { A11yPreferences } from './types'

const STORAGE_KEY = 'legato.a11y'

export function readPreferences(): A11yPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      return { ...DEFAULT_A11Y_PREFERENCES }
    }

    return { ...DEFAULT_A11Y_PREFERENCES, ...(JSON.parse(raw) as Partial<A11yPreferences>) }
  } catch {
    return { ...DEFAULT_A11Y_PREFERENCES }
  }
}

export function applyPreferences(preferences: A11yPreferences): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.style.setProperty('--a11y-text-scale', String(preferences.textScale / 100))
  root.classList.toggle('a11y-dyslexia', preferences.dyslexiaFont)
  root.classList.toggle('a11y-contrast', preferences.highContrast)
  root.classList.toggle('a11y-reduced-motion', preferences.reducedMotion)
  root.classList.toggle('a11y-large-controls', preferences.largeControls)
  root.classList.toggle('a11y-cb-deuteranopia', preferences.colorBlind === 'deuteranopia')
  root.classList.toggle('a11y-cb-protanopia', preferences.colorBlind === 'protanopia')
}

function persist(preferences: A11yPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    return
  }
}

type A11yState = {
  preferences: A11yPreferences
  panelOpen: boolean
  setPreference: <K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]) => void
  reset: () => void
  openPanel: () => void
  closePanel: () => void
}

export const useA11yStore = create<A11yState>((set, get) => ({
  preferences: readPreferences(),
  panelOpen: false,

  setPreference: (key, value) => {
    const preferences = { ...get().preferences, [key]: value }
    applyPreferences(preferences)
    persist(preferences)
    set({ preferences })
  },

  reset: () => {
    const preferences = { ...DEFAULT_A11Y_PREFERENCES }
    applyPreferences(preferences)
    persist(preferences)
    set({ preferences })
  },

  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),
}))

applyPreferences(useA11yStore.getState().preferences)
