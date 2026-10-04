import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { LibraryTrack } from '../library'
import type { TrackAnalysis } from '../musician'
import type { PlaylistRestoreRecord } from '../playlists'
import type { ChannelMode, LoopMode } from '../../player'

export type SongRecord = Omit<
  LibraryTrack,
  'sourceUrl' | 'artworkUrl' | 'artworkBlob' | 'blob' | 'external'
> & {
  externalUrl?: string | null
  blob: Blob
  artwork: Blob | null
}

export type PlaylistRecord = PlaylistRestoreRecord

export type AnalysisRecord = TrackAnalysis

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
}

class LegatoDatabase extends Dexie {
  songs!: Table<SongRecord, string>
  playlists!: Table<PlaylistRecord, string>
  session!: Table<SessionRecord, string>
  analysis!: Table<AnalysisRecord, string>

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
