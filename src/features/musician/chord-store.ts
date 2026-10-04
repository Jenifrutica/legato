import { create } from 'zustand'

export type ChordSheet = {
  trackId: string
  text: string
  updatedAt: number
}

type ChordState = {
  records: Record<string, ChordSheet>
  hydrate: (records: ChordSheet[]) => void
  setText: (trackId: string, text: string) => void
  clear: (trackId: string) => void
}

export const useChordStore = create<ChordState>((set) => ({
  records: {},

  hydrate: (records) => {
    const next: Record<string, ChordSheet> = {}
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
