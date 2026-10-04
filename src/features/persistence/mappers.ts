import type { LibraryTrack } from '../library'
import type { SongRecord } from './db'

export function trackToRecord(track: LibraryTrack, userId?: string): SongRecord {
  return {
    id: track.id,
    ...(userId === undefined ? {} : { userId }),
    title: track.title,
    artist: track.artist,
    album: track.album,
    durationSeconds: track.durationSeconds,
    fileName: track.fileName,
    fileSize: track.fileSize,
    mimeType: track.mimeType,
    mediaType: track.mediaType,
    dedupeKey: track.dedupeKey,
    addedAt: track.addedAt,
    sampleRate: track.sampleRate,
    bitrate: track.bitrate,
    codec: track.codec,
    channels: track.channels,
    blob: track.blob,
    artwork: track.artworkBlob,
    externalUrl: track.external === true ? track.sourceUrl : null,
  }
}

export function recordToTrack(record: SongRecord): LibraryTrack {
  return {
    id: record.id,
    title: record.title,
    artist: record.artist,
    album: record.album,
    durationSeconds: record.durationSeconds,
    sourceUrl: record.externalUrl ?? URL.createObjectURL(record.blob),
    external: record.externalUrl != null,
    artworkUrl: record.artwork === null ? null : URL.createObjectURL(record.artwork),
    artworkBlob: record.artwork,
    blob: record.blob,
    fileName: record.fileName,
    fileSize: record.fileSize,
    mimeType: record.mimeType,
    mediaType: record.mediaType ?? 'audio',
    dedupeKey: record.dedupeKey,
    addedAt: record.addedAt,
    sampleRate: record.sampleRate,
    bitrate: record.bitrate,
    codec: record.codec,
    channels: record.channels,
  }
}
