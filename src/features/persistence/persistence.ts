import { useLibraryStore } from '../library'
import type { LibraryTrack } from '../library'
import {
  noteKey,
  useChordStore,
  useNotesStore,
  useSetlistStore,
  useTrackAnalysisStore,
} from '../musician'
import type { ChordSheet, Note, Setlist, TrackAnalysis } from '../musician'
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

  const setlistRecords = await db.setlists.toArray()
  useSetlistStore.getState().hydrate(setlistRecords)

  const noteRecords = await db.notes.toArray()
  useNotesStore.getState().hydrate(noteRecords)

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
  let lastSetlists = useSetlistStore.getState().setlists
  let lastNotes = useNotesStore.getState().records
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

  useSetlistStore.subscribe((state) => {
    if (state.setlists === lastSetlists) {
      return
    }
    lastSetlists = state.setlists
    void syncSetlists(state.setlists)
  })

  useNotesStore.subscribe((state) => {
    if (state.records === lastNotes) {
      return
    }
    lastNotes = state.records
    void syncNotes(state.records)
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

  await db.transaction('rw', db.songs, db.analysis, db.chords, db.notes, async () => {
    if (stale.length > 0) {
      await db.songs.bulkDelete(stale)
      await db.analysis.bulkDelete(stale)
      await db.chords.bulkDelete(stale)
      await db.notes
        .where('[targetType+targetId]')
        .anyOf(stale.map((id) => ['track', id]))
        .delete()
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

  await db.transaction('rw', db.playlists, db.notes, async () => {
    if (stale.length > 0) {
      await db.playlists.bulkDelete(stale)
      await db.notes
        .where('[targetType+targetId]')
        .anyOf(stale.map((id) => ['playlist', id]))
        .delete()
    }
    await db.playlists.bulkPut(playlists)
  })
}

export async function syncSetlists(setlists: Setlist[]): Promise<void> {
  const db = getDatabase()
  if (db === null) {
    return
  }

  const ids = new Set(setlists.map((setlist) => setlist.id))
  const existing = await db.setlists.toCollection().primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.setlists, async () => {
    if (stale.length > 0) {
      await db.setlists.bulkDelete(stale)
    }
    await db.setlists.bulkPut(setlists)
  })
}

export async function syncNotes(records: Record<string, Note>): Promise<void> {
  const db = getDatabase()
  if (db === null) {
    return
  }

  // Solo se persisten notas de pistas y playlists que existen.
  const known = new Set<string>()
  for (const track of useLibraryStore.getState().tracks) {
    known.add(noteKey('track', track.id))
  }
  for (const playlist of usePlaylistsStore.getState().playlists) {
    known.add(noteKey('playlist', playlist.id))
  }

  const values = Object.values(records).filter((note) =>
    known.has(noteKey(note.targetType, note.targetId)),
  )
  const keep = new Set(values.map((note) => noteKey(note.targetType, note.targetId)))
  const existing = await db.notes.toArray()
  const stale = existing.filter((note) => !keep.has(noteKey(note.targetType, note.targetId)))

  await db.transaction('rw', db.notes, async () => {
    if (stale.length > 0) {
      await db.notes.bulkDelete(stale.map((note) => [note.targetType, note.targetId]))
    }
    await db.notes.bulkPut(values)
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
