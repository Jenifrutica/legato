import { create } from 'zustand'
import { TrackLibrary } from './track-library'
import type { ImportError } from './import-audio-files'
import type { LibraryTrack } from './types'

const library = new TrackLibrary()

type LibraryState = {
  tracks: LibraryTrack[]
  isImporting: boolean
  lastErrors: ImportError[]
  hydrate: (tracks: LibraryTrack[]) => void
  addTracks: (tracks: LibraryTrack[]) => void
  removeTrack: (id: string) => void
  updateTrack: (id: string, patch: Partial<Omit<LibraryTrack, 'id'>>) => void
  setImporting: (value: boolean) => void
  setErrors: (errors: ImportError[]) => void
  existingDedupeKeys: () => Set<string>
}

export const useLibraryStore = create<LibraryState>((set) => ({
  tracks: [],
  isImporting: false,
  lastErrors: [],

  hydrate: (tracks) => {
    library.restore(tracks)
    set({ tracks: library.toArray() })
  },

  addTracks: (newTracks) => {
    for (const track of newTracks) {
      library.add(track)
    }
    set({ tracks: library.toArray() })
  },

  removeTrack: (id) => {
    library.remove(id)
    set({ tracks: library.toArray() })
  },

  updateTrack: (id, patch) => {
    library.update(id, { ...patch, updatedAt: Date.now() })
    set({ tracks: library.toArray() })
  },

  setImporting: (value) => set({ isImporting: value }),
  setErrors: (errors) => set({ lastErrors: errors }),
  existingDedupeKeys: () => new Set(library.toArray().map((track) => track.dedupeKey)),
}))
