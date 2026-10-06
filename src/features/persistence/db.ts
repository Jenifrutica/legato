import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { LibraryTrack } from '../library'
import type { LocalLyrics } from '../lyrics'
import type { ChordSheet, Note, TrackAnalysis } from '../musician'
import type { PlaylistRestoreRecord } from '../playlists'
import type { ChannelMode, LoopMode } from '../../player'

/** Todos los datos musicales llevan el usuario dueño (los antiguos no lo tienen). */
export type OwnedRecord = {
  userId?: string
}

export type SongRecord = Omit<
  LibraryTrack,
  'sourceUrl' | 'artworkUrl' | 'artworkBlob' | 'blob' | 'external'
> &
  OwnedRecord & {
    externalUrl?: string | null
    blob: Blob
    artwork: Blob | null
  }

export type PlaylistRecord = PlaylistRestoreRecord & OwnedRecord

export type AnalysisRecord = TrackAnalysis & OwnedRecord

export type ChordRecord = ChordSheet & OwnedRecord

export type NoteRecord = Note & OwnedRecord

export type LyricsRecord = LocalLyrics & OwnedRecord

export type UserRecord = {
  id: string
  email: string
  name: string
  passwordHash: string
  salt: string
  iterations: number
  createdAt: number
  updatedAt: number
}

export type AuthSessionRecord = {
  tokenHash: string
  userId: string
  createdAt: number
  expiresAt: number
}

export type SessionRecord = {
  key: string
  trackIds: string[]
  currentId: string | null
  currentTime: number
  loopMode: LoopMode
  shuffle: boolean
  volume: number
  rate: number
  balance?: number
  channelMode?: ChannelMode
  crossfadeSeconds?: number
  savedAt?: number
}

/** Lápida de borrado para que la desaparición viaje entre dispositivos. */
export type TombstoneRecord = {
  id: string
  userId?: string
  deletedAt: number
}

class LegatoDatabase extends Dexie {
  songs!: Table<SongRecord, string>
  playlists!: Table<PlaylistRecord, string>
  session!: Table<SessionRecord, string>
  analysis!: Table<AnalysisRecord, string>
  chords!: Table<ChordRecord, string>
  notes!: Table<NoteRecord>
  lyrics!: Table<LyricsRecord, string>
  users!: Table<UserRecord, string>
  authSessions!: Table<AuthSessionRecord, string>
  tombstones!: Table<TombstoneRecord, string>

  constructor() {
    super('legato')
    this.version(1).stores({
      songs: 'id',
      playlists: 'id',
      session: 'key',
    })
    this.version(2).stores({
      songs: 'id',
      playlists: 'id',
      session: 'key',
      analysis: 'trackId',
    })
    this.version(3).stores({
      songs: 'id',
      playlists: 'id',
      session: 'key',
      analysis: 'trackId',
      chords: 'trackId',
    })
    this.version(4).stores({
      songs: 'id',
      playlists: 'id',
      session: 'key',
      analysis: 'trackId',
      chords: 'trackId',
      setlists: 'id',
      notes: '[targetType+targetId]',
    })
    this.version(5).stores({
      songs: 'id',
      playlists: 'id',
      session: 'key',
      analysis: 'trackId',
      chords: 'trackId',
      setlists: 'id',
      notes: '[targetType+targetId]',
      lyrics: 'trackId',
    })
    this.version(6).stores({
      songs: 'id',
      playlists: 'id',
      session: 'key',
      analysis: 'trackId',
      chords: 'trackId',
      setlists: 'id',
      notes: '[targetType+targetId]',
      lyrics: 'trackId',
      users: 'id, &email',
      authSessions: 'tokenHash, userId',
    })
    this.version(7).stores({
      songs: 'id, userId',
      playlists: 'id, userId',
      session: 'key',
      analysis: 'trackId, userId',
      chords: 'trackId, userId',
      setlists: 'id, userId',
      notes: '[targetType+targetId], userId',
      lyrics: 'trackId, userId',
      users: 'id, &email',
      authSessions: 'tokenHash, userId',
    })
    this.version(8).stores({
      songs: 'id, userId',
      playlists: 'id, userId',
      session: 'key',
      analysis: 'trackId, userId',
      chords: 'trackId, userId',
      setlists: 'id, userId',
      notes: '[targetType+targetId], userId',
      lyrics: 'trackId, userId',
      users: 'id, &email',
      authSessions: 'tokenHash, userId',
      tombstones: 'id, userId',
    })
    // v9: se elimina la tabla `setlists` (función retirada).
    this.version(9).stores({
      songs: 'id, userId',
      playlists: 'id, userId',
      session: 'key',
      analysis: 'trackId, userId',
      chords: 'trackId, userId',
      notes: '[targetType+targetId], userId',
      lyrics: 'trackId, userId',
      users: 'id, &email',
      authSessions: 'tokenHash, userId',
      tombstones: 'id, userId',
    })
  }
}

let database: LegatoDatabase | null = null

export function getDatabase(): LegatoDatabase | null {
  if (typeof indexedDB === 'undefined') {
    return null
  }

  database ??= new LegatoDatabase()
  return database
}

/** Borra la base local completa (restablecer aplicación). */
export async function deleteDatabase(): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    return
  }

  const target = database
  database = null
  if (target !== null) {
    await target.delete()
  } else {
    await Dexie.delete('legato')
  }
}
