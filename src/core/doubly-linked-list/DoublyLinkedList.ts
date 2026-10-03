export class DoublyLinkedListNode<T> {
  value: T
  prev: DoublyLinkedListNode<T> | null = null
  next: DoublyLinkedListNode<T> | null = null

  constructor(value: T) {
    this.value = value
  }
}

export class DoublyLinkedList<T> implements Iterable<T> {
  #head: DoublyLinkedListNode<T> | null = null
  #tail: DoublyLinkedListNode<T> | null = null
  #length = 0

  get head(): DoublyLinkedListNode<T> | null {
    return this.#head
  }

  get tail(): DoublyLinkedListNode<T> | null {
    return this.#tail
  }

  get length(): number {
    return this.#length
  }

  get isEmpty(): boolean {
    return this.#length === 0
  }

  prepend(value: T): DoublyLinkedListNode<T> {
    const node = new DoublyLinkedListNode(value)

    if (this.#head === null) {
      this.#head = node
      this.#tail = node
    } else {
      node.next = this.#head
      this.#head.prev = node
      this.#head = node
    }

    this.#length++
    return node
  }

  append(value: T): DoublyLinkedListNode<T> {
    const node = new DoublyLinkedListNode(value)

    if (this.#tail === null) {
      this.#head = node
      this.#tail = node
    } else {
      node.prev = this.#tail
      this.#tail.next = node
      this.#tail = node
    }

    this.#length++
    return node
  }

  insertAt(index: number, value: T): DoublyLinkedListNode<T> {
    this.#assertInsertIndex(index)

    if (index === 0) {
      return this.prepend(value)
    }

    if (index === this.#length) {
      return this.append(value)
    }

    const nextNode = this.nodeAt(index) as DoublyLinkedListNode<T>
    const prevNode = nextNode.prev as DoublyLinkedListNode<T>
    const node = new DoublyLinkedListNode(value)

    node.prev = prevNode
    node.next = nextNode
    prevNode.next = node
    nextNode.prev = node
    this.#length++

    return node
  }

  removeFirst(): T | undefined {
    if (this.#head === null) {
      return undefined
    }

    const value = this.#head.value
    this.#unlink(this.#head)
    return value
  }

  removeLast(): T | undefined {
    if (this.#tail === null) {
      return undefined
    }

    const value = this.#tail.value
    this.#unlink(this.#tail)
    return value
  }

  removeAt(index: number): T | undefined {
    const node = this.nodeAt(index)
    if (node === null) {
      return undefined
    }

    const value = node.value
    this.#unlink(node)
    return value
  }

  removeNode(node: DoublyLinkedListNode<T>): boolean {
    if (!this.#isLinked(node)) {
      return false
    }

    this.#unlink(node)
    return true
  }

  find(predicate: (value: T, index: number) => boolean): DoublyLinkedListNode<T> | null {
    let index = 0

    for (let node = this.#head; node !== null; node = node.next) {
      if (predicate(node.value, index)) {
        return node
      }
      index++
    }

    return null
  }

  nodeAt(index: number): DoublyLinkedListNode<T> | null {
    if (!Number.isInteger(index) || index < 0 || index >= this.#length) {
      return null
    }

    if (index <= this.#length - 1 - index) {
      let node = this.#head
      for (let i = 0; i < index && node !== null; i++) {
        node = node.next
      }
      return node
    }

    let node = this.#tail
    for (let i = this.#length - 1; i > index && node !== null; i--) {
      node = node.prev
    }
    return node
  }

  indexOf(node: DoublyLinkedListNode<T>): number {
    let index = 0

    for (let current = this.#head; current !== null; current = current.next) {
      if (current === node) {
        return index
      }
      index++
    }

    return -1
  }

  contains(node: DoublyLinkedListNode<T>): boolean {
    return this.indexOf(node) !== -1
  }

  moveNode(node: DoublyLinkedListNode<T>, targetIndex: number): boolean {
    const currentIndex = this.indexOf(node)
    if (currentIndex === -1) {
      return false
    }

    this.#assertInsertIndex(targetIndex)

    if (currentIndex === targetIndex) {
      return true
    }

    this.#unlink(node)
    const finalIndex = Math.min(targetIndex, this.#length)
    this.#linkAt(finalIndex, node)
    return true
  }

  swapNodes(a: DoublyLinkedListNode<T>, b: DoublyLinkedListNode<T>): boolean {
    if (a === b) {
      return true
    }

    if (!this.#isLinked(a) || !this.#isLinked(b)) {
      return false
    }

    if (a.next === b) {
      const aPrev = a.prev
      const bNext = b.next

      a.prev = b
      a.next = bNext
      b.prev = aPrev
      b.next = a

      if (aPrev !== null) {
        aPrev.next = b
      } else {
        this.#head = b
      }

      if (bNext !== null) {
        bNext.prev = a
      } else {
        this.#tail = a
      }

      return true
    }

    if (b.next === a) {
      const bPrev = b.prev
      const aNext = a.next

      b.prev = a
      b.next = aNext
      a.prev = bPrev
      a.next = b

      if (bPrev !== null) {
        bPrev.next = a
      } else {
        this.#head = a
      }

      if (aNext !== null) {
        aNext.prev = b
      } else {
        this.#tail = b
      }

      return true
    }

    const aPrev = a.prev
    const aNext = a.next
    const bPrev = b.prev
    const bNext = b.next

    a.prev = bPrev
    a.next = bNext
    b.prev = aPrev
    b.next = aNext

    if (aPrev !== null) {
      aPrev.next = b
    } else {
      this.#head = b
    }

    if (aNext !== null) {
      aNext.prev = b
    } else {
      this.#tail = b
    }

    if (bPrev !== null) {
      bPrev.next = a
    } else {
      this.#head = a
    }

    if (bNext !== null) {
      bNext.prev = a
    } else {
      this.#tail = a
    }

    return true
  }

  reverse(): void {
    let current = this.#head

    while (current !== null) {
      const next = current.next
      current.next = current.prev
      current.prev = next
      current = next
    }

    const previousHead = this.#head
    this.#head = this.#tail
    this.#tail = previousHead
  }

  clear(): void {
    let node = this.#head

    while (node !== null) {
      const next = node.next
      node.prev = null
      node.next = null
      node = next
    }

    this.#head = null
    this.#tail = null
    this.#length = 0
  }

  forEach(callback: (value: T, index: number, node: DoublyLinkedListNode<T>) => void): void {
    let index = 0

    for (let node = this.#head; node !== null; node = node.next) {
      callback(node.value, index, node)
      index++
    }
  }

  toArray(): T[] {
    const result: T[] = []

    for (let node = this.#head; node !== null; node = node.next) {
      result.push(node.value)
    }

    return result
  }

  *values(): IterableIterator<T> {
    for (let node = this.#head; node !== null; node = node.next) {
      yield node.value
    }
  }

  *nodes(): IterableIterator<DoublyLinkedListNode<T>> {
    for (let node = this.#head; node !== null; node = node.next) {
      yield node
    }
  }

  *reverseValues(): IterableIterator<T> {
    for (let node = this.#tail; node !== null; node = node.prev) {
      yield node.value
    }
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values()
  }

  #linkAt(index: number, node: DoublyLinkedListNode<T>): void {
    if (index === 0) {
      node.prev = null
      node.next = this.#head

      if (this.#head !== null) {
        this.#head.prev = node
      }

      this.#head = node

      if (this.#tail === null) {
        this.#tail = node
      }
    } else if (index === this.#length) {
      node.next = null
      node.prev = this.#tail

      if (this.#tail !== null) {
        this.#tail.next = node
      }

      this.#tail = node

      if (this.#head === null) {
        this.#head = node
      }
    } else {
      const nextNode = this.nodeAt(index) as DoublyLinkedListNode<T>
      const prevNode = nextNode.prev as DoublyLinkedListNode<T>

      node.prev = prevNode
      node.next = nextNode
      prevNode.next = node
      nextNode.prev = node
    }

    this.#length++
  }

  #unlink(node: DoublyLinkedListNode<T>): void {
    if (node.prev !== null) {
      node.prev.next = node.next
    } else {
      this.#head = node.next
    }

    if (node.next !== null) {
      node.next.prev = node.prev
    } else {
      this.#tail = node.prev
    }

    node.prev = null
    node.next = null
    this.#length--
  }

  #isLinked(node: DoublyLinkedListNode<T>): boolean {
    if (node === this.#head || node === this.#tail) {
      return true
    }

    return node.prev !== null || node.next !== null
  }

  #assertInsertIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index > this.#length) {
      throw new RangeError(`index ${index} out of bounds [0, ${this.#length}]`)
    }
  }
}
