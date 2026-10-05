import { create } from 'zustand'
import { useHistoryStore } from '../history'
import { useLibraryStore } from '../library'
import type { LibraryTrack } from '../library'
import { PlaylistCollection } from './playlist-collection'
import type { PlaylistRestoreRecord, PlaylistSnapshot, PlaylistStructureNode } from './types'

const collection = new PlaylistCollection()

function registerHistory(
  label: string,
  before: PlaylistSnapshot[],
  beforeSelected: string | null,
  after: PlaylistSnapshot[],
  afterSelected: string | null,
): void {
  const restore = (snapshots: PlaylistSnapshot[], selected: string | null): void => {
    collection.restore(snapshots, useLibraryStore.getState().tracks)
    usePlaylistsStore.setState({
      playlists: collection.toSnapshots(),
      selectedPlaylistId: selected,
    })
  }

  useHistoryStore.getState().push({
    label,
    undo: () => restore(before, beforeSelected),
    redo: () => restore(after, afterSelected),
  })
}

type PlaylistsState = {
  playlists: PlaylistSnapshot[]
  selectedPlaylistId: string | null
  hydrate: (records: PlaylistRestoreRecord[], tracks: LibraryTrack[]) => void
  createPlaylist: (name: string) => string
  renamePlaylist: (id: string, name: string) => void
  duplicatePlaylist: (id: string) => void
  removePlaylist: (id: string) => void
  selectPlaylist: (id: string | null) => void
  addTrackToPlaylist: (playlistId: string, track: LibraryTrack) => boolean
  /** Agrega muchas pistas con un solo paso de historial (importaciones). */
  addTracksToPlaylist: (playlistId: string, tracks: LibraryTrack[]) => number
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
  moveTrackInPlaylist: (playlistId: string, trackId: string, targetIndex: number) => void
}

export const usePlaylistsStore = create<PlaylistsState>((set, get) => ({
  playlists: [],
  selectedPlaylistId: null,

  hydrate: (records, tracks) => {
    collection.restore(records, tracks)
    set({ playlists: collection.toSnapshots(), selectedPlaylistId: null })
  },

  createPlaylist: (name) => {
    const before = collection.toSnapshots()
    const beforeSelected = get().selectedPlaylistId
    const playlist = collection.create(name)
    const after = collection.toSnapshots()
    set({ playlists: after, selectedPlaylistId: playlist.id })
    registerHistory('create', before, beforeSelected, after, playlist.id)
    return playlist.id
  },

  renamePlaylist: (id, name) => {
    const before = collection.toSnapshots()
    const beforeSelected = get().selectedPlaylistId

    if (collection.rename(id, name)) {
      const after = collection.toSnapshots()
      set({ playlists: after })
      registerHistory('rename', before, beforeSelected, after, beforeSelected)
    }
  },

  duplicatePlaylist: (id) => {
    const before = collection.toSnapshots()
    const beforeSelected = get().selectedPlaylistId
    const copy = collection.duplicate(id)

    if (copy !== null) {
      const after = collection.toSnapshots()
      set({ playlists: after, selectedPlaylistId: copy.id })
      registerHistory('duplicate', before, beforeSelected, after, copy.id)
    }
  },

  removePlaylist: (id) => {
    const before = collection.toSnapshots()
    const beforeSelected = get().selectedPlaylistId

    if (collection.remove(id)) {
      const after = collection.toSnapshots()
      const selected = beforeSelected === id ? null : beforeSelected
      set({ playlists: after, selectedPlaylistId: selected })
      registerHistory('remove', before, beforeSelected, after, selected)
    }
  },

  selectPlaylist: (id) => set({ selectedPlaylistId: id }),

  addTrackToPlaylist: (playlistId, track) => {
    const before = collection.toSnapshots()
    const beforeSelected = get().selectedPlaylistId
    const added = collection.addTrack(playlistId, track)

    if (added) {
      const after = collection.toSnapshots()
      set({ playlists: after })
      registerHistory('add-track', before, beforeSelected, after, beforeSelected)
    }

    return added
  },

  addTracksToPlaylist: (playlistId, tracks) => {
    const before = collection.toSnapshots()
    const beforeSelected = get().selectedPlaylistId
    let added = 0

    for (const track of tracks) {
      if (collection.addTrack(playlistId, track)) {
        added++
      }
    }

    if (added > 0) {
      const after = collection.toSnapshots()
      set({ playlists: after })
      registerHistory('add-tracks', before, beforeSelected, after, beforeSelected)
    }

    return added
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    const before = collection.toSnapshots()
    const beforeSelected = get().selectedPlaylistId

    if (collection.removeTrack(playlistId, trackId)) {
      const after = collection.toSnapshots()
      set({ playlists: after })
      registerHistory('remove-track', before, beforeSelected, after, beforeSelected)
    }
  },

  moveTrackInPlaylist: (playlistId, trackId, targetIndex) => {
    const before = collection.toSnapshots()
    const beforeSelected = get().selectedPlaylistId

    if (collection.moveTrack(playlistId, trackId, targetIndex)) {
      const after = collection.toSnapshots()
      set({ playlists: after })
      registerHistory('move-track', before, beforeSelected, after, beforeSelected)
    }
  },
}))

export function getPlaylistTracks(playlistId: string): LibraryTrack[] {
  return collection.tracksOf(playlistId)
}

export function getPlaylistStructure(playlistId: string): PlaylistStructureNode[] {
  return collection.structureOf(playlistId)
}
