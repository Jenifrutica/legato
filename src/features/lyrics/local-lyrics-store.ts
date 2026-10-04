import { create } from 'zustand'

export type LocalLyrics = {
  trackId: string
  text: string
  updatedAt: number
}

type LocalLyricsState = {
  records: Record<string, LocalLyrics>
  hydrate: (records: LocalLyrics[]) => void
  setText: (trackId: string, text: string) => void
  clear: (trackId: string) => void
}

export const useLocalLyricsStore = create<LocalLyricsState>((set) => ({
  records: {},

  hydrate: (records) => {
    const next: Record<string, LocalLyrics> = {}
    for (const record of records) {
      next[record.trackId] = record
    }
    set({ records: next })
  },

  setText: (trackId, text) =>
    set((state) => ({
      records: {
        ...state.records,
        [trackId]: { trackId, text, updatedAt: Date.now() },
      },
    })),

  clear: (trackId) =>
    set((state) => {
      const next = { ...state.records }
      delete next[trackId]
      return { records: next }
    }),
}))
