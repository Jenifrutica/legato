import type { LibraryTrack } from '../library'
import type { SongRecord } from './db'

export function trackToRecord(track: LibraryTrack): SongRecord {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    durationSeconds: track.durationSeconds,
    fileName: track.fileName,
    fileSize: track.fileSize,
    mimeType: track.mimeType,
    dedupeKey: track.dedupeKey,
    addedAt: track.addedAt,
    sampleRate: track.sampleRate,
    bitrate: track.bitrate,
    codec: track.codec,
    channels: track.channels,
    blob: track.blob,
    artwork: track.artworkBlob,
  }
}

export function recordToTrack(record: SongRecord): LibraryTrack {
  return {
    id: record.id,
    title: record.title,
    artist: record.artist,
    album: record.album,
    durationSeconds: record.durationSeconds,
    sourceUrl: URL.createObjectURL(record.blob),
    artworkUrl: record.artwork === null ? null : URL.createObjectURL(record.artwork),
    artworkBlob: record.artwork,
    blob: record.blob,
    fileName: record.fileName,
    fileSize: record.fileSize,
    mimeType: record.mimeType,
    dedupeKey: record.dedupeKey,
    addedAt: record.addedAt,
    sampleRate: record.sampleRate,
    bitrate: record.bitrate,
    codec: record.codec,
    channels: record.channels,
  }
}
