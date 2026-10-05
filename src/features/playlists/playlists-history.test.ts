import { beforeEach, describe, expect, it } from 'vitest'
import { useHistoryStore } from '../history'
import { useLibraryStore } from '../library'
import type { LibraryTrack } from '../library'
import { usePlaylistsStore } from './playlist-store'

function track(id: string): LibraryTrack {
  return {
    id,
    title: `Cancion ${id}`,
    artist: 'Artista',
    album: null,
    durationSeconds: 180,
    sourceUrl: `blob:${id}`,
    artworkUrl: null,
    artworkBlob: null,
    blob: new Blob(['audio'], { type: 'audio/mpeg' }),
    fileName: `${id}.mp3`,
    fileSize: 1024,
    mimeType: 'audio/mpeg',
    dedupeKey: `${id}.mp3:1024:0`,
    addedAt: 0,
    sampleRate: 44100,
    bitrate: 320000,
    codec: 'MP3',
    channels: 2,
  }
}

const A = track('a')
const B = track('b')
const C = track('c')

describe('playlists store with history', () => {
  beforeEach(() => {
    useLibraryStore.getState().hydrate([A, B, C])
    usePlaylistsStore.getState().hydrate([], [])
    useHistoryStore.getState().clear()
  })

  it('deshace y rehace crear una playlist', () => {
    usePlaylistsStore.getState().createPlaylist('Set')
    expect(usePlaylistsStore.getState().playlists).toHaveLength(1)
    expect(useHistoryStore.getState().canUndo).toBe(true)

    useHistoryStore.getState().undo()
    expect(usePlaylistsStore.getState().playlists).toHaveLength(0)

    useHistoryStore.getState().redo()
    expect(usePlaylistsStore.getState().playlists).toHaveLength(1)
    expect(usePlaylistsStore.getState().playlists[0]?.name).toBe('Set')
  })

  it('deshace agregar, mover y quitar canciones', () => {
    const id = usePlaylistsStore.getState().createPlaylist('Set')
    usePlaylistsStore.getState().addTrackToPlaylist(id, A)
    usePlaylistsStore.getState().addTrackToPlaylist(id, B)
    usePlaylistsStore.getState().addTrackToPlaylist(id, C)
    expect(usePlaylistsStore.getState().playlists[0]?.trackIds).toEqual(['a', 'b', 'c'])

    usePlaylistsStore.getState().moveTrackInPlaylist(id, 'c', 0)
    expect(usePlaylistsStore.getState().playlists[0]?.trackIds).toEqual(['c', 'a', 'b'])

    useHistoryStore.getState().undo()
    expect(usePlaylistsStore.getState().playlists[0]?.trackIds).toEqual(['a', 'b', 'c'])

    usePlaylistsStore.getState().removeTrackFromPlaylist(id, 'b')
    expect(usePlaylistsStore.getState().playlists[0]?.trackIds).toEqual(['a', 'c'])

    useHistoryStore.getState().undo()
    expect(usePlaylistsStore.getState().playlists[0]?.trackIds).toEqual(['a', 'b', 'c'])
  })

  it('agrega muchas pistas en un solo paso de historial (importación)', () => {
    const id = usePlaylistsStore.getState().createPlaylist('Set')
    const added = usePlaylistsStore.getState().addTracksToPlaylist(id, [A, B, C, A])

    expect(added).toBe(3)
    expect(usePlaylistsStore.getState().playlists[0]?.trackIds).toEqual(['a', 'b', 'c'])

    useHistoryStore.getState().undo()
    expect(usePlaylistsStore.getState().playlists[0]?.trackIds).toEqual([])
  })

  it('deshace eliminar una playlist con sus canciones', () => {
    const id = usePlaylistsStore.getState().createPlaylist('Set')
    usePlaylistsStore.getState().addTrackToPlaylist(id, A)
    usePlaylistsStore.getState().removePlaylist(id)
    expect(usePlaylistsStore.getState().playlists).toHaveLength(0)

    useHistoryStore.getState().undo()

    expect(usePlaylistsStore.getState().playlists).toHaveLength(1)
    expect(usePlaylistsStore.getState().playlists[0]?.trackIds).toEqual(['a'])
  })

  it('deshace renombrar', () => {
    const id = usePlaylistsStore.getState().createPlaylist('Vieja')
    usePlaylistsStore.getState().renamePlaylist(id, 'Nueva')
    expect(usePlaylistsStore.getState().playlists[0]?.name).toBe('Nueva')

    useHistoryStore.getState().undo()
    expect(usePlaylistsStore.getState().playlists[0]?.name).toBe('Vieja')
  })

  it('un comando nuevo limpia el rehacer', () => {
    const id = usePlaylistsStore.getState().createPlaylist('Set')
    usePlaylistsStore.getState().renamePlaylist(id, 'Otra')
    useHistoryStore.getState().undo()
    expect(useHistoryStore.getState().canRedo).toBe(true)

    usePlaylistsStore.getState().renamePlaylist(id, 'Tercera')
    expect(useHistoryStore.getState().canRedo).toBe(false)
  })
})
