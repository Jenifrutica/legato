import { create } from 'zustand'
import { CommandStack } from './command-stack'
import type { Command } from './command-stack'

const stack = new CommandStack()

type HistoryState = {
  canUndo: boolean
  canRedo: boolean
  push: (command: Command) => void
  undo: () => void
  redo: () => void
  clear: () => void
}

export const useHistoryStore = create<HistoryState>((set) => ({
  canUndo: false,
  canRedo: false,

  push: (command) => {
    stack.push(command)
    set({ canUndo: stack.canUndo, canRedo: stack.canRedo })
  },

  undo: () => {
    if (stack.undo()) {
      set({ canUndo: stack.canUndo, canRedo: stack.canRedo })
    }
  },

  redo: () => {
    if (stack.redo()) {
      set({ canUndo: stack.canUndo, canRedo: stack.canRedo })
    }
  },

  clear: () => {
    stack.clear()
    set({ canUndo: false, canRedo: false })
  },
}))

export function getCommandStack(): CommandStack {
  return stack
}
