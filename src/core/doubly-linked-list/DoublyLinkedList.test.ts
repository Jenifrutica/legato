import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { DoublyLinkedList, DoublyLinkedListNode } from './DoublyLinkedList'

function expectInvariants<T>(list: DoublyLinkedList<T>): void {
  if (list.length === 0) {
    expect(list.head).toBeNull()
    expect(list.tail).toBeNull()
    return
  }

  expect(list.head).not.toBeNull()
  expect(list.tail).not.toBeNull()
  expect(list.head?.prev).toBeNull()
  expect(list.tail?.next).toBeNull()

  let count = 0
  let node = list.head
  while (node !== null) {
    if (node.next !== null) {
      expect(node.next.prev).toBe(node)
    }
    if (node.prev !== null) {
      expect(node.prev.next).toBe(node)
    }
    count++
    expect(count).toBeLessThanOrEqual(list.length)
    node = node.next
  }

  expect(count).toBe(list.length)
}

describe('DoublyLinkedList: casos borde', () => {
  it('empieza vacia', () => {
    const list = new DoublyLinkedList<number>()
    expect(list.length).toBe(0)
    expect(list.isEmpty).toBe(true)
    expect(list.head).toBeNull()
    expect(list.tail).toBeNull()
    expect(list.removeFirst()).toBeUndefined()
    expect(list.removeLast()).toBeUndefined()
    expect(list.removeAt(0)).toBeUndefined()
    expect(list.toArray()).toEqual([])
    expect([...list]).toEqual([])
    expectInvariants(list)
  })

  it('prepend y append mantienen el orden', () => {
    const list = new DoublyLinkedList<number>()
    list.append(2)
    list.prepend(1)
    list.append(3)
    expect(list.toArray()).toEqual([1, 2, 3])
    expect(list.head?.value).toBe(1)
    expect(list.tail?.value).toBe(3)
    expect(list.length).toBe(3)
    expectInvariants(list)
  })

  it('insertAt en inicio, medio y final', () => {
    const list = new DoublyLinkedList<number>()
    list.insertAt(0, 1)
    expect(list.toArray()).toEqual([1])
    list.insertAt(1, 3)
    expect(list.toArray()).toEqual([1, 3])
    list.insertAt(1, 2)
    expect(list.toArray()).toEqual([1, 2, 3])
    list.insertAt(0, 0)
    expect(list.toArray()).toEqual([0, 1, 2, 3])
    expectInvariants(list)
  })

  it('insertAt fuera de rango lanza RangeError', () => {
    const list = new DoublyLinkedList<number>()
    expect(() => list.insertAt(-1, 1)).toThrow(RangeError)
    expect(() => list.insertAt(1, 1)).toThrow(RangeError)
    expect(() => list.insertAt(0.5, 1)).toThrow(RangeError)
    expect(() => list.insertAt(Number.NaN, 1)).toThrow(RangeError)
  })

  it('con un solo nodo: eliminar por referencia', () => {
    const list = new DoublyLinkedList<string>()
    const only = list.append('x')
    expect(list.removeNode(only)).toBe(true)
    expect(list.length).toBe(0)
    expect(list.head).toBeNull()
    expect(list.tail).toBeNull()
    expectInvariants(list)
  })

  it('removeFirst, removeLast y removeAt en cabeza, cola y medio', () => {
    const list = new DoublyLinkedList<number>()
    ;[1, 2, 3, 4, 5].forEach((v) => list.append(v))
    expect(list.removeFirst()).toBe(1)
    expect(list.removeLast()).toBe(5)
    expect(list.removeAt(1)).toBe(3)
    expect(list.toArray()).toEqual([2, 4])
    expectInvariants(list)
  })

  it('removeNode rechaza un nodo ajeno', () => {
    const list = new DoublyLinkedList<number>()
    list.append(1)
    const foreign = new DoublyLinkedListNode(99)
    expect(list.removeNode(foreign)).toBe(false)
    expect(list.length).toBe(1)
  })

  it('nodeAt, find, indexOf y contains', () => {
    const list = new DoublyLinkedList<number>()
    ;[10, 20, 30, 40].forEach((v) => list.append(v))
    expect(list.nodeAt(0)?.value).toBe(10)
    expect(list.nodeAt(3)?.value).toBe(40)
    expect(list.nodeAt(-1)).toBeNull()
    expect(list.nodeAt(4)).toBeNull()
    const found = list.find((v) => v === 30)
    expect(found?.value).toBe(30)
    expect(list.find((v) => v === 999)).toBeNull()
    expect(list.indexOf(found as DoublyLinkedListNode<number>)).toBe(2)
    expect(list.contains(found as DoublyLinkedListNode<number>)).toBe(true)
    expect(list.indexOf(new DoublyLinkedListNode(30))).toBe(-1)
  })

  it('moveNode a la misma posicion no cambia nada', () => {
    const list = new DoublyLinkedList<number>()
    ;[1, 2, 3].forEach((v) => list.append(v))
    const middle = list.nodeAt(1) as DoublyLinkedListNode<number>
    expect(list.moveNode(middle, 1)).toBe(true)
    expect(list.toArray()).toEqual([1, 2, 3])
    expect(list.indexOf(middle)).toBe(1)
    expectInvariants(list)
  })

  it('moveNode hacia adelante y hacia atras', () => {
    const list = new DoublyLinkedList<number>()
    ;[1, 2, 3, 4].forEach((v) => list.append(v))
    const first = list.nodeAt(0) as DoublyLinkedListNode<number>
    expect(list.moveNode(first, 2)).toBe(true)
    expect(list.toArray()).toEqual([2, 3, 1, 4])
    expect(list.moveNode(first, 0)).toBe(true)
    expect(list.toArray()).toEqual([1, 2, 3, 4])
    expectInvariants(list)
  })

  it('bug #12: mover otra cancion no cambia la que esta sonando', () => {
    const list = new DoublyLinkedList<string>()
    ;['A', 'B', 'C'].forEach((v) => list.append(v))
    const current = list.find((v) => v === 'A') as DoublyLinkedListNode<string>
    const third = list.find((v) => v === 'C') as DoublyLinkedListNode<string>

    list.moveNode(third, 0)

    expect(list.toArray()).toEqual(['C', 'A', 'B'])
    expect(current.value).toBe('A')
    expect(list.indexOf(current)).toBe(1)
    expect(current.next?.value).toBe('B')
    expectInvariants(list)
  })

  it('bug #12: mover la cancion actual conserva su identidad', () => {
    const list = new DoublyLinkedList<string>()
    ;['A', 'B', 'C'].forEach((v) => list.append(v))
    const current = list.find((v) => v === 'A') as DoublyLinkedListNode<string>

    list.moveNode(current, 2)

    expect(list.toArray()).toEqual(['B', 'C', 'A'])
    expect(current.value).toBe('A')
    expect(current.prev?.value).toBe('C')
    expect(current.next).toBeNull()
    expectInvariants(list)
  })

  it('swapNodes: adyacentes, no adyacentes y mismo nodo', () => {
    const list = new DoublyLinkedList<number>()
    ;[1, 2, 3, 4].forEach((v) => list.append(v))
    const n1 = list.nodeAt(0) as DoublyLinkedListNode<number>
    const n2 = list.nodeAt(1) as DoublyLinkedListNode<number>
    const n4 = list.nodeAt(3) as DoublyLinkedListNode<number>

    expect(list.swapNodes(n1, n2)).toBe(true)
    expect(list.toArray()).toEqual([2, 1, 3, 4])
    expectInvariants(list)

    expect(list.swapNodes(n1, n4)).toBe(true)
    expect(list.toArray()).toEqual([2, 4, 3, 1])
    expectInvariants(list)

    expect(list.swapNodes(n1, n1)).toBe(true)
    expect(list.toArray()).toEqual([2, 4, 3, 1])
    expectInvariants(list)
  })

  it('reverse invierte enlaces y extremos', () => {
    const list = new DoublyLinkedList<number>()
    ;[1, 2, 3].forEach((v) => list.append(v))
    list.reverse()
    expect(list.toArray()).toEqual([3, 2, 1])
    expect([...list.reverseValues()]).toEqual([1, 2, 3])
    expect(list.head?.value).toBe(3)
    expect(list.tail?.value).toBe(1)
    expectInvariants(list)
  })

  it('iteradores y forEach', () => {
    const list = new DoublyLinkedList<number>()
    ;[1, 2, 3].forEach((v) => list.append(v))
    expect([...list.values()]).toEqual([1, 2, 3])
    expect([...list].map((v) => v * 2)).toEqual([2, 4, 6])
    expect([...list.nodes()].map((n) => n.value)).toEqual([1, 2, 3])
    expect([...list.reverseValues()]).toEqual([3, 2, 1])

    const visited: number[] = []
    list.forEach((value, index, node) => {
      expect(node.value).toBe(value)
      visited.push(value + index)
    })
    expect(visited).toEqual([1, 3, 5])
  })

  it('clear deja la lista vacia', () => {
    const list = new DoublyLinkedList<number>()
    ;[1, 2, 3].forEach((v) => list.append(v))
    const first = list.head as DoublyLinkedListNode<number>
    list.clear()
    expect(list.length).toBe(0)
    expect(list.head).toBeNull()
    expect(list.tail).toBeNull()
    expect(first.prev).toBeNull()
    expect(first.next).toBeNull()
    expectInvariants(list)
  })
})

type Op =
  | { kind: 'prepend'; value: number }
  | { kind: 'append'; value: number }
  | { kind: 'insertAt'; index: number; value: number }
  | { kind: 'removeAt'; index: number }
  | { kind: 'removeFirst' }
  | { kind: 'removeLast' }
  | { kind: 'moveNode'; from: number; to: number }
  | { kind: 'reverse' }

const opArbitrary: fc.Arbitrary<Op> = fc.oneof(
  fc.record({ kind: fc.constant('prepend' as const), value: fc.integer() }),
  fc.record({ kind: fc.constant('append' as const), value: fc.integer() }),
  fc.record({ kind: fc.constant('insertAt' as const), index: fc.nat(20), value: fc.integer() }),
  fc.record({ kind: fc.constant('removeAt' as const), index: fc.nat(20) }),
  fc.record({ kind: fc.constant('removeFirst' as const) }),
  fc.record({ kind: fc.constant('removeLast' as const) }),
  fc.record({ kind: fc.constant('moveNode' as const), from: fc.nat(20), to: fc.nat(20) }),
  fc.record({ kind: fc.constant('reverse' as const) }),
)

function applyOp(
  list: DoublyLinkedList<number>,
  model: number[],
  nodes: DoublyLinkedListNode<number>[],
  op: Op,
): void {
  const length = model.length

  switch (op.kind) {
    case 'prepend': {
      nodes.unshift(list.prepend(op.value))
      model.unshift(op.value)
      break
    }
    case 'append': {
      nodes.push(list.append(op.value))
      model.push(op.value)
      break
    }
    case 'insertAt': {
      const index = Math.min(op.index, length)
      nodes.splice(index, 0, list.insertAt(index, op.value))
      model.splice(index, 0, op.value)
      break
    }
    case 'removeAt': {
      if (length === 0) {
        break
      }
      const index = op.index % length
      expect(list.removeAt(index)).toBe(model[index])
      nodes.splice(index, 1)
      model.splice(index, 1)
      break
    }
    case 'removeFirst': {
      expect(list.removeFirst()).toBe(model.shift())
      nodes.shift()
      break
    }
    case 'removeLast': {
      expect(list.removeLast()).toBe(model.pop())
      nodes.pop()
      break
    }
    case 'moveNode': {
      if (length === 0) {
        break
      }
      const from = op.from % length
      const to = Math.min(op.to, length - 1)
      const node = nodes[from]
      const [value] = model.splice(from, 1)
      nodes.splice(from, 1)
      model.splice(to, 0, value)
      nodes.splice(to, 0, node)
      expect(list.moveNode(node, to)).toBe(true)
      break
    }
    case 'reverse': {
      list.reverse()
      model.reverse()
      nodes.reverse()
      break
    }
  }
}

describe('DoublyLinkedList: property-based', () => {
  it('equivale a un modelo de array y mantiene invariantes', () => {
    fc.assert(
      fc.property(fc.array(opArbitrary, { maxLength: 60 }), (ops) => {
        const list = new DoublyLinkedList<number>()
        const model: number[] = []
        const nodes: DoublyLinkedListNode<number>[] = []

        for (const op of ops) {
          applyOp(list, model, nodes, op)
          expect(list.toArray()).toEqual(model)
          expect(list.length).toBe(model.length)
          expect(nodes.length).toBe(list.length)
          expectInvariants(list)
        }
      }),
      { numRuns: 300 },
    )
  })

  it('insertar y eliminar por referencia nunca rompe los enlaces', () => {
    fc.assert(
      fc.property(fc.array(fc.integer(), { minLength: 1, maxLength: 40 }), (values) => {
        const list = new DoublyLinkedList<number>()
        const nodes = values.map((value) => list.append(value))

        for (const node of nodes) {
          expect(list.contains(node)).toBe(true)
        }

        for (const node of nodes) {
          expect(list.removeNode(node)).toBe(true)
          expectInvariants(list)
        }

        expect(list.length).toBe(0)
      }),
      { numRuns: 200 },
    )
  })
})
