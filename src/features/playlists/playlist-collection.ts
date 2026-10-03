import { DoublyLinkedList } from '../../core/doubly-linked-list'
import type { DoublyLinkedListNode } from '../../core/doubly-linked-list'
import type { LibraryTrack } from '../library'
import type { Playlist, PlaylistSnapshot, PlaylistStructureNode } from './types'

export class PlaylistCollection {
  #playlists = new DoublyLinkedList<Playlist>()
  #playlistNodes = new Map<string, DoublyLinkedListNode<Playlist>>()
  #tracks = new Map<string, DoublyLinkedList<LibraryTrack>>()

  get size(): number {
    return this.#playlists.length
  }

  create(name: string): Playlist {
    const now = Date.now()
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name: name.trim() === '' ? 'Nueva playlist' : name.trim(),
      createdAt: now,
      updatedAt: now,
    }

    const node = this.#playlists.append(playlist)
    this.#playlistNodes.set(playlist.id, node)
    this.#tracks.set(playlist.id, new DoublyLinkedList<LibraryTrack>())
    return playlist
  }

  find(id: string): Playlist | null {
    return this.#playlistNodes.get(id)?.value ?? null
  }

  toArray(): Playlist[] {
    return this.#playlists.toArray()
  }

  rename(id: string, name: string): boolean {
    const node = this.#playlistNodes.get(id)
    const trimmed = name.trim()

    if (node === undefined || trimmed === '') {
      return false
    }

    node.value = { ...node.value, name: trimmed, updatedAt: Date.now() }
    return true
  }

  duplicate(id: string): Playlist | null {
    const source = this.find(id)
    if (source === null) {
      return null
    }

    const copy = this.create(`${source.name} (copia)`)
    const copyTracks = this.#tracks.get(copy.id)

    if (copyTracks !== undefined) {
      for (const track of this.tracksOf(id)) {
        copyTracks.append(track)
      }
    }

    return copy
  }

  remove(id: string): boolean {
    const node = this.#playlistNodes.get(id)
    if (node === undefined) {
      return false
    }

    this.#playlists.removeNode(node)
    this.#playlistNodes.delete(id)
    this.#tracks.delete(id)
    return true
  }

  addTrack(playlistId: string, track: LibraryTrack): boolean {
    const list = this.#tracks.get(playlistId)
    if (list === undefined || list.find((candidate) => candidate.id === track.id) !== null) {
      return false
    }

    list.append(track)
    this.#touch(playlistId)
    return true
  }

  removeTrack(playlistId: string, trackId: string): boolean {
    const list = this.#tracks.get(playlistId)
    if (list === undefined) {
      return false
    }

    const node = list.find((candidate) => candidate.id === trackId)
    if (node === null) {
      return false
    }

    list.removeNode(node)
    this.#touch(playlistId)
    return true
  }

  moveTrack(playlistId: string, trackId: string, targetIndex: number): boolean {
    const list = this.#tracks.get(playlistId)
    if (list === undefined) {
      return false
    }

    const node = list.find((candidate) => candidate.id === trackId)
    if (node === null) {
      return false
    }

    const moved = list.moveNode(node, targetIndex)
    if (moved) {
      this.#touch(playlistId)
    }
    return moved
  }

  tracksOf(playlistId: string): LibraryTrack[] {
    return this.#tracks.get(playlistId)?.toArray() ?? []
  }

  structureOf(playlistId: string): PlaylistStructureNode[] {
    const list = this.#tracks.get(playlistId)
    if (list === undefined) {
      return []
    }

    const nodes: PlaylistStructureNode[] = []
    for (const node of list.nodes()) {
      nodes.push({
        id: node.value.id,
        title: node.value.title,
        prevId: node.prev?.value.id ?? null,
        nextId: node.next?.value.id ?? null,
      })
    }

    return nodes
  }

  trackCount(playlistId: string): number {
    return this.#tracks.get(playlistId)?.length ?? 0
  }

  containsTrack(playlistId: string, trackId: string): boolean {
    return this.#tracks.get(playlistId)?.find((track) => track.id === trackId) !== null
  }

  toSnapshots(): PlaylistSnapshot[] {
    return this.#playlists.toArray().map((playlist) => ({
      ...playlist,
      trackIds: this.tracksOf(playlist.id).map((track) => track.id),
    }))
  }

  clear(): void {
    this.#playlists.clear()
    this.#playlistNodes.clear()
    this.#tracks.clear()
  }

  #touch(id: string): void {
    const node = this.#playlistNodes.get(id)
    if (node !== undefined) {
      node.value = { ...node.value, updatedAt: Date.now() }
    }
  }
}
