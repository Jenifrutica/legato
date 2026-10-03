import { create } from 'zustand'
import type { SourceId } from './types'

const STORAGE_KEY = 'legato.sources'

const DEFAULT_ENABLED: Record<SourceId, boolean> = {
  spotify: true,
  audius: true,
  jamendo: true,
}

function readEnabled(): Record<SourceId, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      return { ...DEFAULT_ENABLED }
    }

    return { ...DEFAULT_ENABLED, ...(JSON.parse(raw) as Partial<Record<SourceId, boolean>>) }
  } catch {
    return { ...DEFAULT_ENABLED }
  }
}

type ProvidersState = {
  enabled: Record<SourceId, boolean>
  setEnabled: (id: SourceId, value: boolean) => void
}

export const useProvidersStore = create<ProvidersState>((set, get) => ({
  enabled: readEnabled(),

  setEnabled: (id, value) => {
    const enabled = { ...get().enabled, [id]: value }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled))
    } catch {
      set({ enabled })
      return
    }
    set({ enabled })
  },
}))
