import { DoublyLinkedList } from '../../core/doubly-linked-list'

export type Command = {
  label: string
  undo: () => void
  redo: () => void
}

export class CommandStack {
  #undoStack = new DoublyLinkedList<Command>()
  #redoStack = new DoublyLinkedList<Command>()

  get canUndo(): boolean {
    return this.#undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.#redoStack.length > 0
  }

  get size(): number {
    return this.#undoStack.length
  }

  push(command: Command): void {
    this.#undoStack.append(command)
    this.#redoStack.clear()
  }

  undo(): boolean {
    const node = this.#undoStack.tail
    if (node === null) {
      return false
    }

    this.#undoStack.removeLast()
    node.value.undo()
    this.#redoStack.append(node.value)
    return true
  }

  redo(): boolean {
    const node = this.#redoStack.tail
    if (node === null) {
      return false
    }

    this.#redoStack.removeLast()
    node.value.redo()
    this.#undoStack.append(node.value)
    return true
  }

  clear(): void {
    this.#undoStack.clear()
    this.#redoStack.clear()
  }
}
