import { importAudioFiles, useLibraryStore } from '../library'
import type { LibraryTrack } from '../library'
import { usePlaylistsStore } from '../playlists'
import type { SourceTrack } from './types'

export async function saveSourceTrack(
  track: SourceTrack,
  existingKeys: Set<string>,
): Promise<LibraryTrack | null> {
  if (track.streamUrl === null || !track.downloadable) {
    return null
  }

  const response = await fetch(track.streamUrl)
  if (!response.ok) {
    throw new Error(`download ${response.status}`)
  }

  const blob = await response.blob()
  const extension = blob.type.includes('wav') ? 'wav' : 'mp3'
  const file = new File([blob], `${track.artist} - ${track.title}.${extension}`, {
    type: blob.type === '' ? 'audio/mpeg' : blob.type,
  })
  const result = await importAudioFiles([file], existingKeys)
  return result.tracks[0] ?? null
}

export async function importSourceTrackToPlaylist(
  track: SourceTrack,
  playlistId: string,
): Promise<boolean> {
  const library = useLibraryStore.getState()
  const saved = await saveSourceTrack(track, library.existingDedupeKeys())
  if (saved === null) {
    return false
  }

  library.addTracks([saved])
  return usePlaylistsStore.getState().addTrackToPlaylist(playlistId, saved)
}
