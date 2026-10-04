import { DoublyLinkedList } from '../../core/doubly-linked-list'

export type SetlistItem = {
  trackId: string
  played: boolean
}

export type Setlist = {
  id: string
  name: string
  items: SetlistItem[]
  createdAt: number
  updatedAt: number
}

/** Reordena un setlist con la lista doblemente enlazada del núcleo. */
export function moveSetlistItem(
  items: SetlistItem[],
  trackId: string,
  targetIndex: number,
): SetlistItem[] {
  const list = new DoublyLinkedList<SetlistItem>()
  for (const item of items) {
    list.append(item)
  }

  const node = list.find((item) => item.trackId === trackId)
  if (node === null) {
    return items
  }

  list.moveNode(node, targetIndex)
  return list.toArray()
}

export function toggleSetlistItem(items: SetlistItem[], trackId: string): SetlistItem[] {
  return items.map((item) => (item.trackId === trackId ? { ...item, played: !item.played } : item))
}

export function removeSetlistItem(items: SetlistItem[], trackId: string): SetlistItem[] {
  return items.filter((item) => item.trackId !== trackId)
}
