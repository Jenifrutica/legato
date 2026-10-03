import { DoublyLinkedList } from '../../core/doubly-linked-list'
import type { DoublyLinkedListNode } from '../../core/doubly-linked-list'
import type { LibraryTrack } from './types'

export class TrackLibrary {
  #list = new DoublyLinkedList<LibraryTrack>()
  #byId = new Map<string, DoublyLinkedListNode<LibraryTrack>>()

  get size(): number {
    return this.#list.length
  }

  has(id: string): boolean {
    return this.#byId.has(id)
  }

  find(id: string): LibraryTrack | null {
    return this.#byId.get(id)?.value ?? null
  }

  toArray(): LibraryTrack[] {
    return this.#list.toArray()
  }

  add(track: LibraryTrack): boolean {
    if (this.#byId.has(track.id)) {
      return false
    }

    const node = this.#list.append(track)
    this.#byId.set(track.id, node)
    return true
  }

  update(id: string, patch: Partial<Omit<LibraryTrack, 'id'>>): boolean {
    const node = this.#byId.get(id)
    if (node === undefined) {
      return false
    }

    node.value = { ...node.value, ...patch }
    return true
  }

  remove(id: string): boolean {
    const node = this.#byId.get(id)
    if (node === undefined) {
      return false
    }

    this.#list.removeNode(node)
    this.#byId.delete(id)
    return true
  }

  clear(): void {
    this.#list.clear()
    this.#byId.clear()
  }

  restore(tracks: LibraryTrack[]): void {
    this.clear()

    for (const track of tracks) {
      this.add(track)
    }
  }
}
