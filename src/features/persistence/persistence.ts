import { useLibraryStore } from '../library'
import type { LibraryTrack } from '../library'
import { useChordStore, useTrackAnalysisStore } from '../musician'
import type { ChordSheet, TrackAnalysis } from '../musician'
import { usePlaylistsStore } from '../playlists'
import type { PlaylistRestoreRecord } from '../playlists'
import { usePlayerStore } from '../../player'
import { getDatabase } from './db'
import type { SessionRecord } from './db'
import { recordToTrack, trackToRecord } from './mappers'

export async function hydrateStores(): Promise<boolean> {
  const db = getDatabase()
  if (db === null) {
    return false
  }

  const songRecords = await db.songs.toArray()
  const tracks = songRecords.map(recordToTrack)
  useLibraryStore.getState().hydrate(tracks)

  const playlistRecords = await db.playlists.toArray()
  usePlaylistsStore.getState().hydrate(playlistRecords, tracks)

  const session = await db.session.get('current')
  if (session !== undefined) {
    usePlayerStore.getState().restoreSession(session)
  }

  const analysisRecords = await db.analysis.toArray()
  useTrackAnalysisStore.getState().hydrate(analysisRecords)

  const chordRecords = await db.chords.toArray()
  useChordStore.getState().hydrate(chordRecords)

  return true
}

export function startPersistence(): void {
  const db = getDatabase()
  if (db === null) {
    return
  }

  let lastTracks = useLibraryStore.getState().tracks
  let lastPlaylists = usePlaylistsStore.getState().playlists
  let lastAnalysis = useTrackAnalysisStore.getState().records
  let lastChords = useChordStore.getState().records
  let sessionTimer: ReturnType<typeof setTimeout> | null = null

  useLibraryStore.subscribe((state) => {
    if (state.tracks === lastTracks) {
      return
    }
    lastTracks = state.tracks
    void syncSongs(state.tracks)
  })

  usePlaylistsStore.subscribe((state) => {
    if (state.playlists === lastPlaylists) {
      return
    }
    lastPlaylists = state.playlists
    void syncPlaylists(state.playlists)
  })

  useTrackAnalysisStore.subscribe((state) => {
    if (state.records === lastAnalysis) {
      return
    }
    lastAnalysis = state.records
    void syncAnalysis(state.records)
  })

  useChordStore.subscribe((state) => {
    if (state.records === lastChords) {
      return
    }
    lastChords = state.records
    void syncChords(state.records)
  })

  usePlayerStore.subscribe(() => {
    if (sessionTimer !== null) {
      return
    }

    sessionTimer = setTimeout(() => {
      sessionTimer = null
      void saveCurrentSession()
    }, 1500)
  })

  window.addEventListener('pagehide', () => {
    void saveCurrentSession()
  })
}

export async function syncSongs(tracks: LibraryTrack[]): Promise<void> {
  const db = getDatabase()
  if (db === null) {
    return
  }

  const records = tracks.map(trackToRecord)
  const ids = new Set(records.map((record) => record.id))
  const existing = await db.songs.toCollection().primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.songs, db.analysis, db.chords, async () => {
    if (stale.length > 0) {
      await db.songs.bulkDelete(stale)
      await db.analysis.bulkDelete(stale)
      await db.chords.bulkDelete(stale)
    }
    await db.songs.bulkPut(records)
  })
}

export async function syncAnalysis(records: Record<string, TrackAnalysis>): Promise<void> {
  const db = getDatabase()
  if (db === null) {
    return
  }

  // Solo se persiste el análisis de pistas que siguen en la biblioteca.
  const known = new Set(useLibraryStore.getState().tracks.map((track) => track.id))
  const values = Object.values(records).filter((record) => known.has(record.trackId))
  const ids = new Set(values.map((record) => record.trackId))
  const existing = await db.analysis.toCollection().primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.analysis, async () => {
    if (stale.length > 0) {
      await db.analysis.bulkDelete(stale)
    }
    await db.analysis.bulkPut(values)
  })
}

export async function syncChords(records: Record<string, ChordSheet>): Promise<void> {
  const db = getDatabase()
  if (db === null) {
    return
  }

  // Solo se persiste la hoja de acordes de pistas que siguen en la biblioteca.
  const known = new Set(useLibraryStore.getState().tracks.map((track) => track.id))
  const values = Object.values(records).filter((record) => known.has(record.trackId))
  const ids = new Set(values.map((record) => record.trackId))
  const existing = await db.chords.toCollection().primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.chords, async () => {
    if (stale.length > 0) {
      await db.chords.bulkDelete(stale)
    }
    await db.chords.bulkPut(values)
  })
}

export async function syncPlaylists(playlists: PlaylistRestoreRecord[]): Promise<void> {
  const db = getDatabase()
  if (db === null) {
    return
  }

  const ids = new Set(playlists.map((playlist) => playlist.id))
  const existing = await db.playlists.toCollection().primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.playlists, async () => {
    if (stale.length > 0) {
      await db.playlists.bulkDelete(stale)
    }
    await db.playlists.bulkPut(playlists)
  })
}

export async function saveCurrentSession(): Promise<void> {
  const db = getDatabase()
  if (db === null) {
    return
  }

  const snapshot = usePlayerStore.getState()
  const record: SessionRecord = {
    key: 'current',
    trackIds: snapshot.queue.map((track) => track.id),
    currentId: snapshot.currentTrack?.id ?? null,
    currentTime: snapshot.currentTime,
    loopMode: snapshot.loopMode,
    shuffle: snapshot.shuffle,
    volume: snapshot.volume,
    rate: snapshot.rate,
    balance: snapshot.balance,
    channelMode: snapshot.channelMode,
    crossfadeSeconds: snapshot.crossfadeSeconds,
  }

  await db.session.put(record)
}
