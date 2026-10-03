import { importAudioFiles, useLibraryStore } from '../library'
import type { LibraryTrack } from '../library'
import { usePlaylistsStore } from '../playlists'
import type { SourceTrack } from './types'

export function buildExternalTrack(track: SourceTrack): LibraryTrack | null {
  if (track.sourceId !== 'spotify' || track.externalUrl === null) {
    return null
  }

  return {
    id: `spotify:${track.id}`,
    title: track.title,
    artist: track.artist,
    album: track.album,
    durationSeconds: track.durationSeconds,
    sourceUrl: track.externalUrl,
    artworkUrl: track.artworkUrl,
    artworkBlob: null,
    blob: new Blob([]),
    fileName: `${track.artist} - ${track.title}.spotify`,
    fileSize: 0,
    mimeType: 'audio/spotify',
    mediaType: 'audio',
    external: true,
    dedupeKey: `spotify:${track.id}`,
    addedAt: Date.now(),
    sampleRate: null,
    bitrate: null,
    codec: 'Spotify',
    channels: null,
  }
}

export async function saveSourceTrack(
  track: SourceTrack,
  existingKeys: Set<string>,
): Promise<LibraryTrack | null> {
  if (!track.downloadable) {
    const external = buildExternalTrack(track)
    if (external === null) {
      return null
    }

    const existing = useLibraryStore
      .getState()
      .tracks.find((item) => item.dedupeKey === external.dedupeKey)
    return existing ?? external
  }

  if (track.streamUrl === null) {
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
