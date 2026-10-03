import { DoublyLinkedList } from '../core/doubly-linked-list'
import type { DoublyLinkedListNode } from '../core/doubly-linked-list'
import type { LoopMode, QueueState, QueueTrack } from './types'

function shuffleValues<T>(values: T[]): T[] {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temporary = values[i]
    values[i] = values[j]
    values[j] = temporary
  }

  return values
}

export class PlaybackQueue {
  #list = new DoublyLinkedList<QueueTrack>()
  #current: DoublyLinkedListNode<QueueTrack> | null = null
  #loopMode: LoopMode = 'none'
  #playOrder: DoublyLinkedList<QueueTrack> | null = null
  #shuffleNode: DoublyLinkedListNode<QueueTrack> | null = null

  get size(): number {
    return this.#list.length
  }

  get loopMode(): LoopMode {
    return this.#loopMode
  }

  get shuffle(): boolean {
    return this.#playOrder !== null
  }

  get currentTrack(): QueueTrack | null {
    return this.#current?.value ?? null
  }

  get currentIndex(): number {
    return this.#current === null ? -1 : this.#list.indexOf(this.#current)
  }

  get tracks(): QueueTrack[] {
    return this.#list.toArray()
  }

  setLoopMode(mode: LoopMode): void {
    this.#loopMode = mode
  }

  add(track: QueueTrack): void {
    const node = this.#list.append(track)

    if (this.#playOrder !== null) {
      this.#playOrder.append(track)
    }

    if (this.#current === null) {
      this.#current = node
    }
  }

  remove(trackId: string): boolean {
    const node = this.#list.find((track) => track.id === trackId)
    if (node === null) {
      return false
    }

    const wasCurrent = node === this.#current
    const nextNode = node.next
    this.#list.removeNode(node)

    if (this.#playOrder !== null) {
      const orderNode = this.#playOrder.find((track) => track.id === trackId)
      if (orderNode !== null) {
        const removingShuffleCurrent = orderNode === this.#shuffleNode
        const orderNext = orderNode.next
        this.#playOrder.removeNode(orderNode)
        if (removingShuffleCurrent) {
          this.#shuffleNode = orderNext ?? this.#playOrder.tail
        }
      }
    }

    if (wasCurrent) {
      this.#current = nextNode ?? this.#list.tail
    }

    return true
  }

  clear(): void {
    this.#list.clear()
    this.#playOrder = null
    this.#shuffleNode = null
    this.#current = null
  }

  setCurrent(trackId: string): boolean {
    const node = this.#list.find((track) => track.id === trackId)
    if (node === null) {
      return false
    }

    this.#current = node

    if (this.#playOrder !== null) {
      this.#shuffleNode = this.#playOrder.find((track) => track.id === trackId)
    }

    return true
  }

  next(): QueueTrack | null {
    if (this.#playOrder !== null) {
      return this.#nextShuffled()
    }

    const nextNode = this.#current?.next ?? null

    if (nextNode === null) {
      if (this.#loopMode !== 'all' || this.#list.head === null) {
        return null
      }
      this.#current = this.#list.head
    } else {
      this.#current = nextNode
    }

    return this.#current.value
  }

  previous(): QueueTrack | null {
    if (this.#playOrder !== null) {
      return this.#previousShuffled()
    }

    const previousNode = this.#current?.prev ?? null

    if (previousNode === null) {
      if (this.#loopMode !== 'all' || this.#list.tail === null) {
        return null
      }
      this.#current = this.#list.tail
    } else {
      this.#current = previousNode
    }

    return this.#current.value
  }

  setShuffle(enabled: boolean): void {
    if (enabled === this.shuffle) {
      return
    }

    if (!enabled) {
      this.#playOrder = null
      this.#shuffleNode = null
      return
    }

    const order = new DoublyLinkedList<QueueTrack>()
    for (const track of shuffleValues(this.#list.toArray())) {
      order.append(track)
    }

    this.#playOrder = order
    const currentId = this.#current?.value.id ?? null
    this.#shuffleNode = currentId === null ? order.head : order.find((t) => t.id === currentId)
    if (this.#shuffleNode === null) {
      this.#shuffleNode = order.head
    }
  }

  toState(): QueueState {
    return {
      trackIds: this.#list.toArray().map((track) => track.id),
      currentId: this.currentTrack?.id ?? null,
      loopMode: this.#loopMode,
      shuffle: this.shuffle,
    }
  }

  restore(tracks: QueueTrack[], state: QueueState): void {
    this.clear()
    this.#loopMode = state.loopMode

    const byId = new Map(tracks.map((track) => [track.id, track]))
    for (const id of state.trackIds) {
      const track = byId.get(id)
      if (track !== undefined) {
        this.#list.append(track)
      }
    }

    if (state.currentId !== null) {
      const node = this.#list.find((track) => track.id === state.currentId)
      this.#current = node ?? this.#list.head
    } else {
      this.#current = this.#list.head
    }

    if (state.shuffle) {
      this.setShuffle(true)
    }
  }

  #nextShuffled(): QueueTrack | null {
    const order = this.#playOrder
    if (order === null) {
      return null
    }

    const nextNode = this.#shuffleNode?.next ?? null

    if (nextNode === null) {
      if (this.#loopMode !== 'all' || order.head === null) {
        return null
      }
      this.#shuffleNode = order.head
    } else {
      this.#shuffleNode = nextNode
    }

    const track = this.#shuffleNode.value
    this.#current = this.#list.find((candidate) => candidate.id === track.id)
    return track
  }

  #previousShuffled(): QueueTrack | null {
    const order = this.#playOrder
    if (order === null) {
      return null
    }

    const previousNode = this.#shuffleNode?.prev ?? null

    if (previousNode === null) {
      if (this.#loopMode !== 'all' || order.tail === null) {
        return null
      }
      this.#shuffleNode = order.tail
    } else {
      this.#shuffleNode = previousNode
    }

    const track = this.#shuffleNode.value
    this.#current = this.#list.find((candidate) => candidate.id === track.id)
    return track
  }
}
