import { create } from 'zustand'

export type NoteTargetType = 'track' | 'playlist'

export type Note = {
  targetId: string
  targetType: NoteTargetType
  text: string
  updatedAt: number
}

export function noteKey(targetType: NoteTargetType, targetId: string): string {
  return `${targetType}:${targetId}`
}

type NotesState = {
  records: Record<string, Note>
  hydrate: (notes: Note[]) => void
  setText: (targetType: NoteTargetType, targetId: string, text: string) => void
  clear: (targetType: NoteTargetType, targetId: string) => void
}

export const useNotesStore = create<NotesState>((set) => ({
  records: {},

  hydrate: (notes) => {
    const next: Record<string, Note> = {}
    for (const note of notes) {
      next[noteKey(note.targetType, note.targetId)] = note
    }
    set({ records: next })
  },

  setText: (targetType, targetId, text) =>
    set((state) => ({
      records: {
        ...state.records,
        [noteKey(targetType, targetId)]: { targetType, targetId, text, updatedAt: Date.now() },
      },
    })),

  clear: (targetType, targetId) =>
    set((state) => {
      const next = { ...state.records }
      delete next[noteKey(targetType, targetId)]
      return { records: next }
    }),
}))
