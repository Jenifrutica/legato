import { create } from 'zustand'
import type { LibraryTrack } from '../library'
import { PlaylistCollection } from './playlist-collection'
import type { PlaylistSnapshot, PlaylistStructureNode } from './types'

const collection = new PlaylistCollection()

type PlaylistsState = {
  playlists: PlaylistSnapshot[]
  selectedPlaylistId: string | null
  createPlaylist: (name: string) => string
  renamePlaylist: (id: string, name: string) => void
  duplicatePlaylist: (id: string) => void
  removePlaylist: (id: string) => void
  selectPlaylist: (id: string | null) => void
  addTrackToPlaylist: (playlistId: string, track: LibraryTrack) => boolean
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
  moveTrackInPlaylist: (playlistId: string, trackId: string, targetIndex: number) => void
}

export const usePlaylistsStore = create<PlaylistsState>((set, get) => ({
  playlists: [],
  selectedPlaylistId: null,

  createPlaylist: (name) => {
    const playlist = collection.create(name)
    set({ playlists: collection.toSnapshots(), selectedPlaylistId: playlist.id })
    return playlist.id
  },

  renamePlaylist: (id, name) => {
    if (collection.rename(id, name)) {
      set({ playlists: collection.toSnapshots() })
    }
  },

  duplicatePlaylist: (id) => {
    const copy = collection.duplicate(id)
    if (copy !== null) {
      set({ playlists: collection.toSnapshots(), selectedPlaylistId: copy.id })
    }
  },

  removePlaylist: (id) => {
    if (collection.remove(id)) {
      const selected = get().selectedPlaylistId
      set({
        playlists: collection.toSnapshots(),
        selectedPlaylistId: selected === id ? null : selected,
      })
    }
  },

  selectPlaylist: (id) => set({ selectedPlaylistId: id }),

  addTrackToPlaylist: (playlistId, track) => {
    const added = collection.addTrack(playlistId, track)
    if (added) {
      set({ playlists: collection.toSnapshots() })
    }
    return added
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    if (collection.removeTrack(playlistId, trackId)) {
      set({ playlists: collection.toSnapshots() })
    }
  },

  moveTrackInPlaylist: (playlistId, trackId, targetIndex) => {
    if (collection.moveTrack(playlistId, trackId, targetIndex)) {
      set({ playlists: collection.toSnapshots() })
    }
  },
}))

export function getPlaylistTracks(playlistId: string): LibraryTrack[] {
  return collection.tracksOf(playlistId)
}

export function getPlaylistStructure(playlistId: string): PlaylistStructureNode[] {
  return collection.structureOf(playlistId)
}
