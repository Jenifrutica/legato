import { describe, expect, it, vi } from 'vitest'
import { CommandStack } from './command-stack'

describe('CommandStack', () => {
  it('apila, deshace y rehace', () => {
    const stack = new CommandStack()
    const undo = vi.fn()
    const redo = vi.fn()
    stack.push({ label: 'x', undo, redo })

    expect(stack.canUndo).toBe(true)
    expect(stack.canRedo).toBe(false)

    expect(stack.undo()).toBe(true)
    expect(undo).toHaveBeenCalledTimes(1)
    expect(stack.canRedo).toBe(true)

    expect(stack.redo()).toBe(true)
    expect(redo).toHaveBeenCalledTimes(1)
    expect(stack.canUndo).toBe(true)
  })

  it('vacia el rehacer al apilar un comando nuevo', () => {
    const stack = new CommandStack()
    stack.push({ label: 'a', undo: () => undefined, redo: () => undefined })
    stack.undo()

    expect(stack.canRedo).toBe(true)

    stack.push({ label: 'b', undo: () => undefined, redo: () => undefined })

    expect(stack.canRedo).toBe(false)
    expect(stack.size).toBe(1)
  })

  it('sin comandos no hace nada', () => {
    const stack = new CommandStack()
    expect(stack.undo()).toBe(false)
    expect(stack.redo()).toBe(false)
  })

  it('clear vacia ambas pilas', () => {
    const stack = new CommandStack()
    stack.push({ label: 'a', undo: () => undefined, redo: () => undefined })
    stack.undo()
    stack.clear()

    expect(stack.canUndo).toBe(false)
    expect(stack.canRedo).toBe(false)
  })
})
