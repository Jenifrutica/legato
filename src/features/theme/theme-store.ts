import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'legato.theme'

function readMode(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyThemeMode(mode: ThemeMode): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.classList.toggle('theme-dark', mode === 'dark')
  document.documentElement.style.colorScheme = mode
}

type ThemeState = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: readMode(),

  setMode: (mode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      set({ mode })
      return
    }
    applyThemeMode(mode)
    set({ mode })
  },

  toggle: () => get().setMode(get().mode === 'dark' ? 'light' : 'dark'),
}))

applyThemeMode(useThemeStore.getState().mode)
