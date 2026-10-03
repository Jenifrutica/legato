import { create } from 'zustand'

export type PlayEntry = {
  plays: number
  firstPlayedAt: number
  lastPlayedAt: number
}

export type PlayLog = Record<string, PlayEntry>

const STORAGE_KEY = 'legato.plays.v1'

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
    const raw = localStorage.getItem(STORAGE_KEY)
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    // sin persistencia
  }
}

type PlayLogState = {
  log: PlayLog
  register: (trackId: string) => void
  clear: () => void
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
}))
