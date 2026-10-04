import { create } from 'zustand'

const STORAGE_KEY = 'legato.sync.enabled'

type SyncStatus = 'off' | 'idle' | 'syncing' | 'error'

function readEnabled(): boolean {
  if (typeof localStorage === 'undefined') {
    return false
  }
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0'
  } catch {
    return false
  }
}

type SyncState = {
  enabled: boolean
  status: SyncStatus
  lastSyncAt: number | null
  progress: { done: number; total: number } | null
  error: string | null
  setEnabled: (enabled: boolean) => void
}

/** Estado de la sincronización en la nube (Firestore + Storage). */
export const useSyncStore = create<SyncState>((set) => ({
  enabled: readEnabled(),
  status: 'off',
  lastSyncAt: null,
  progress: null,
  error: null,

  setEnabled: (enabled) => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
    } catch {
      // sin persistencia
    }
    set({ enabled, status: enabled ? 'idle' : 'off', error: null, progress: null })
  },
}))
