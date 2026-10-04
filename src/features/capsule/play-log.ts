import { create } from 'zustand'

export type PlayEntry = {
  plays: number
  firstPlayedAt: number
  lastPlayedAt: number
}

export type PlayLog = Record<string, PlayEntry>

const STORAGE_KEY_BASE = 'legato.plays.v1'
let scopeSuffix = ''

function storageKey(): string {
  return `${STORAGE_KEY_BASE}${scopeSuffix}`
}

export function registerPlay(log: PlayLog, trackId: string, now: number): PlayLog {
  const previous = log[trackId]
  return {
    ...log,
    [trackId]: {
      plays: (previous?.plays ?? 0) + 1,
      firstPlayedAt: previous?.firstPlayedAt ?? now,
      lastPlayedAt: now,
    },
  }
}

function readLog(): PlayLog {
  if (typeof localStorage === 'undefined') {
    return {}
  }

  try {
    const raw = localStorage.getItem(storageKey())
    if (raw === null) {
      return {}
    }
    const parsed = JSON.parse(raw) as PlayLog
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function writeLog(log: PlayLog): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(storageKey(), JSON.stringify(log))
  } catch {
    // sin persistencia
  }
}

type PlayLogState = {
  log: PlayLog
  register: (trackId: string) => void
  clear: () => void
  setScope: (userId: string | null) => void
}

export const usePlayLogStore = create<PlayLogState>((set, get) => ({
  log: readLog(),

  register: (trackId) => {
    const next = registerPlay(get().log, trackId, Date.now())
    writeLog(next)
    set({ log: next })
  },

  clear: () => {
    writeLog({})
    set({ log: {} })
  },

  setScope: (userId) => {
    scopeSuffix = userId === null ? '' : `.${userId}`

    // Los registros previos (sin cuenta) pasan al primer usuario.
    if (userId !== null && typeof localStorage !== 'undefined') {
      try {
        const legacy = localStorage.getItem(STORAGE_KEY_BASE)
        if (localStorage.getItem(storageKey()) === null && legacy !== null) {
          localStorage.setItem(storageKey(), legacy)
          localStorage.removeItem(STORAGE_KEY_BASE)
        }
      } catch {
        // sin persistencia
      }
    }

    set({ log: readLog() })
  },
}))
