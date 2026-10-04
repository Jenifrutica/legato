import { create } from 'zustand'
import { moveSetlistItem, removeSetlistItem, toggleSetlistItem } from './setlist'
import type { Setlist } from './setlist'

type SetlistState = {
  setlists: Setlist[]
  selectedId: string | null
  hydrate: (setlists: Setlist[]) => void
  create: (name: string, trackIds?: string[]) => string
  remove: (id: string) => void
  select: (id: string | null) => void
  moveItem: (id: string, trackId: string, targetIndex: number) => void
  togglePlayed: (id: string, trackId: string) => void
  removeItem: (id: string, trackId: string) => void
}

function updateSetlist(
  setlists: Setlist[],
  id: string,
  update: (setlist: Setlist) => Setlist,
): Setlist[] {
  return setlists.map((setlist) => (setlist.id === id ? update(setlist) : setlist))
}

export const useSetlistStore = create<SetlistState>((set) => ({
  setlists: [],
  selectedId: null,

  hydrate: (setlists) =>
    set((state) => ({
      setlists,
      selectedId:
        state.selectedId !== null && setlists.some((item) => item.id === state.selectedId)
          ? state.selectedId
          : (setlists[0]?.id ?? null),
    })),

  create: (name, trackIds = []) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    const setlist: Setlist = {
      id,
      name: name.trim() === '' ? 'Setlist' : name.trim(),
      items: trackIds.map((trackId) => ({ trackId, played: false })),
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ setlists: [...state.setlists, setlist], selectedId: id }))
    return id
  },

  remove: (id) =>
    set((state) => {
      const setlists = state.setlists.filter((setlist) => setlist.id !== id)
      return {
        setlists,
        selectedId: state.selectedId === id ? (setlists[0]?.id ?? null) : state.selectedId,
      }
    }),

  select: (id) => set({ selectedId: id }),

  moveItem: (id, trackId, targetIndex) =>
    set((state) => ({
      setlists: updateSetlist(state.setlists, id, (setlist) => ({
        ...setlist,
        items: moveSetlistItem(setlist.items, trackId, targetIndex),
        updatedAt: Date.now(),
      })),
    })),

  togglePlayed: (id, trackId) =>
    set((state) => ({
      setlists: updateSetlist(state.setlists, id, (setlist) => ({
        ...setlist,
        items: toggleSetlistItem(setlist.items, trackId),
        updatedAt: Date.now(),
      })),
    })),

  removeItem: (id, trackId) =>
    set((state) => ({
      setlists: updateSetlist(state.setlists, id, (setlist) => ({
        ...setlist,
        items: removeSetlistItem(setlist.items, trackId),
        updatedAt: Date.now(),
      })),
    })),
}))
