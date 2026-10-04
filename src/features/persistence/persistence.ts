import { useLibraryStore } from '../library'
import type { LibraryTrack } from '../library'
import { useLocalLyricsStore } from '../lyrics'
import type { LocalLyrics } from '../lyrics'
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
import type { Table } from 'dexie'
import { getDatabase } from './db'
import type { SessionRecord } from './db'
import { recordToTrack, trackToRecord } from './mappers'

let activeUserId: string | null = null
let persistenceCleanup: (() => void) | null = null

export function getActiveUserId(): string | null {
  return activeUserId
}

export function setActiveUserId(userId: string | null): void {
  activeUserId = userId
}

function scopeKey(userId: string): string {
  return `current:${userId}`
}

/**
 * El primer usuario adopta los datos que quedaron sin dueño (biblioteca,
 * playlists, sesión y análisis previos a las cuentas).
 */
export async function adoptOrphanData(
  userId: string,
  options: { inheritLocalAccounts?: boolean } = {},
): Promise<void> {
  const db = getDatabase()
  if (db === null) {
    return
  }

  const tables = [
    db.songs,
    db.playlists,
    db.analysis,
    db.chords,
    db.setlists,
    db.notes,
    db.lyrics,
  ] as unknown as Array<Table<{ userId?: string }>>

  for (const table of tables) {
    const records = await table.toArray()
    const orphans = records.filter((record) => record.userId == null)
    if (orphans.length > 0) {
      await table.bulkPut(orphans.map((record) => ({ ...record, userId })))
    }
  }

  const legacy = await db.session.get('current')
  if (legacy !== undefined) {
    await db.session.put({ ...legacy, key: scopeKey(userId) })
    await db.session.delete('current')
  }

  // Al pasar de cuenta local a la nube (Firebase), los datos de las cuentas
  // locales anteriores se heredan al primer usuario real que entra. Entre
  // cuentas locales (respaldo) no se hereda: cada una sigue aislada.
  const localUsers = options.inheritLocalAccounts === true ? await db.users.toArray() : []
  const localIds = localUsers.map((user) => user.id)
  if (localIds.length > 0) {
    for (const table of tables) {
      const records = await table.toArray()
      const inherited = records.filter(
        (record) => record.userId != null && localIds.includes(record.userId),
      )
      if (inherited.length > 0) {
        await table.bulkPut(inherited.map((record) => ({ ...record, userId })))
      }
    }

    for (const localId of localIds) {
      const session = await db.session.get(scopeKey(localId))
      if (session !== undefined) {
        await db.session.put({ ...session, key: scopeKey(userId) })
        await db.session.delete(scopeKey(localId))
      }
    }

    const tombstones = await db.tombstones.toArray()
    const inheritedTombstones = tombstones.filter(
      (tombstone) => tombstone.userId != null && localIds.includes(tombstone.userId),
    )
    if (inheritedTombstones.length > 0) {
      await db.tombstones.bulkPut(
        inheritedTombstones.map((tombstone) => ({ ...tombstone, userId })),
      )
    }
  }
}

export async function hydrateStores(): Promise<boolean> {
  const db = getDatabase()
  const userId = activeUserId
  if (db === null || userId === null) {
    return false
  }

  const songRecords = await db.songs.where('userId').equals(userId).toArray()
  const tracks = songRecords.map(recordToTrack)
  useLibraryStore.getState().hydrate(tracks)

  const playlistRecords = await db.playlists.where('userId').equals(userId).toArray()
  usePlaylistsStore.getState().hydrate(playlistRecords, tracks)

  const session = await db.session.get(scopeKey(userId))
  if (session !== undefined) {
    usePlayerStore.getState().restoreSession(session)
  }

  const analysisRecords = await db.analysis.where('userId').equals(userId).toArray()
  useTrackAnalysisStore.getState().hydrate(analysisRecords)

  const chordRecords = await db.chords.where('userId').equals(userId).toArray()
  useChordStore.getState().hydrate(chordRecords)

  const setlistRecords = await db.setlists.where('userId').equals(userId).toArray()
  useSetlistStore.getState().hydrate(setlistRecords)

  const noteRecords = await db.notes.where('userId').equals(userId).toArray()
  useNotesStore.getState().hydrate(noteRecords)

  const lyricsRecords = await db.lyrics.where('userId').equals(userId).toArray()
  useLocalLyricsStore.getState().hydrate(lyricsRecords)

  return true
}

/** Vacía los stores al cerrar sesión (los datos siguen en la base por usuario). */
export function resetStores(): void {
  usePlayerStore.getState().pause()
  usePlayerStore.setState({
    currentTrack: null,
    queue: [],
    queueStructure: [],
    currentTime: 0,
    duration: 0,
  })
  useLibraryStore.getState().hydrate([])
  usePlaylistsStore.getState().hydrate([], [])
  useTrackAnalysisStore.getState().hydrate([])
  useChordStore.getState().hydrate([])
  useSetlistStore.getState().hydrate([])
  useNotesStore.getState().hydrate([])
  useLocalLyricsStore.getState().hydrate([])
}

export function startPersistence(): void {
  if (persistenceCleanup !== null || activeUserId === null) {
    return
  }

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
  let lastLyrics = useLocalLyricsStore.getState().records
  let sessionTimer: ReturnType<typeof setTimeout> | null = null

  const unsubscribers = [
    useLibraryStore.subscribe((state) => {
      if (state.tracks === lastTracks) {
        return
      }
      lastTracks = state.tracks
      void syncSongs(state.tracks)
    }),
    usePlaylistsStore.subscribe((state) => {
      if (state.playlists === lastPlaylists) {
        return
      }
      lastPlaylists = state.playlists
      void syncPlaylists(state.playlists)
    }),
    useTrackAnalysisStore.subscribe((state) => {
      if (state.records === lastAnalysis) {
        return
      }
      lastAnalysis = state.records
      void syncAnalysis(state.records)
    }),
    useChordStore.subscribe((state) => {
      if (state.records === lastChords) {
        return
      }
      lastChords = state.records
      void syncChords(state.records)
    }),
    useSetlistStore.subscribe((state) => {
      if (state.setlists === lastSetlists) {
        return
      }
      lastSetlists = state.setlists
      void syncSetlists(state.setlists)
    }),
    useNotesStore.subscribe((state) => {
      if (state.records === lastNotes) {
        return
      }
      lastNotes = state.records
      void syncNotes(state.records)
    }),
    useLocalLyricsStore.subscribe((state) => {
      if (state.records === lastLyrics) {
        return
      }
      lastLyrics = state.records
      void syncLyrics(state.records)
    }),
    usePlayerStore.subscribe(() => {
      if (sessionTimer !== null) {
        return
      }
      sessionTimer = setTimeout(() => {
        sessionTimer = null
        void saveCurrentSession()
      }, 1500)
    }),
  ]

  const onPageHide = () => {
    void saveCurrentSession()
  }
  window.addEventListener('pagehide', onPageHide)

  persistenceCleanup = () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe()
    }
    if (sessionTimer !== null) {
      clearTimeout(sessionTimer)
      sessionTimer = null
    }
    window.removeEventListener('pagehide', onPageHide)
  }
}

export function stopPersistence(): void {
  persistenceCleanup?.()
  persistenceCleanup = null
}

export async function syncSongs(tracks: LibraryTrack[]): Promise<void> {
  const db = getDatabase()
  const userId = activeUserId
  if (db === null || userId === null) {
    return
  }

  const records = tracks.map((track) => trackToRecord(track, userId))
  const ids = new Set(records.map((record) => record.id))
  const existing = await db.songs.where('userId').equals(userId).primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction(
    'rw',
    [db.songs, db.analysis, db.chords, db.notes, db.lyrics, db.tombstones],
    async () => {
      if (stale.length > 0) {
        const deletedAt = Date.now()
        await db.songs.bulkDelete(stale)
        await db.analysis.bulkDelete(stale)
        await db.chords.bulkDelete(stale)
        await db.lyrics.bulkDelete(stale)
        await db.notes
          .where('[targetType+targetId]')
          .anyOf(stale.map((id) => ['track', id]))
          .delete()
        await db.tombstones.bulkPut(
          stale.flatMap((id) => [
            { id: `songs:${id}`, userId, deletedAt },
            { id: `analysis:${id}`, userId, deletedAt },
            { id: `chords:${id}`, userId, deletedAt },
            { id: `lyrics:${id}`, userId, deletedAt },
            { id: `notes:track:${id}`, userId, deletedAt },
          ]),
        )
      }
      await db.songs.bulkPut(records)
    },
  )
}

export async function syncAnalysis(records: Record<string, TrackAnalysis>): Promise<void> {
  const db = getDatabase()
  const userId = activeUserId
  if (db === null || userId === null) {
    return
  }

  const known = new Set(useLibraryStore.getState().tracks.map((track) => track.id))
  const values = Object.values(records)
    .filter((record) => known.has(record.trackId))
    .map((record) => ({ ...record, userId }))
  const ids = new Set(values.map((record) => record.trackId))
  const existing = await db.analysis.where('userId').equals(userId).primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.analysis, db.tombstones, async () => {
    if (stale.length > 0) {
      const deletedAt = Date.now()
      await db.analysis.bulkDelete(stale)
      await db.tombstones.bulkPut(stale.map((id) => ({ id: `analysis:${id}`, userId, deletedAt })))
    }
    await db.analysis.bulkPut(values)
  })
}

export async function syncChords(records: Record<string, ChordSheet>): Promise<void> {
  const db = getDatabase()
  const userId = activeUserId
  if (db === null || userId === null) {
    return
  }

  const known = new Set(useLibraryStore.getState().tracks.map((track) => track.id))
  const values = Object.values(records)
    .filter((record) => known.has(record.trackId))
    .map((record) => ({ ...record, userId }))
  const ids = new Set(values.map((record) => record.trackId))
  const existing = await db.chords.where('userId').equals(userId).primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.chords, db.tombstones, async () => {
    if (stale.length > 0) {
      const deletedAt = Date.now()
      await db.chords.bulkDelete(stale)
      await db.tombstones.bulkPut(stale.map((id) => ({ id: `chords:${id}`, userId, deletedAt })))
    }
    await db.chords.bulkPut(values)
  })
}

export async function syncLyrics(records: Record<string, LocalLyrics>): Promise<void> {
  const db = getDatabase()
  const userId = activeUserId
  if (db === null || userId === null) {
    return
  }

  const known = new Set(useLibraryStore.getState().tracks.map((track) => track.id))
  const values = Object.values(records)
    .filter((record) => known.has(record.trackId))
    .map((record) => ({ ...record, userId }))
  const ids = new Set(values.map((record) => record.trackId))
  const existing = await db.lyrics.where('userId').equals(userId).primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.lyrics, db.tombstones, async () => {
    if (stale.length > 0) {
      const deletedAt = Date.now()
      await db.lyrics.bulkDelete(stale)
      await db.tombstones.bulkPut(stale.map((id) => ({ id: `lyrics:${id}`, userId, deletedAt })))
    }
    await db.lyrics.bulkPut(values)
  })
}

export async function syncPlaylists(playlists: PlaylistRestoreRecord[]): Promise<void> {
  const db = getDatabase()
  const userId = activeUserId
  if (db === null || userId === null) {
    return
  }

  const records = playlists.map((playlist) => ({ ...playlist, userId }))
  const ids = new Set(records.map((playlist) => playlist.id))
  const existing = await db.playlists.where('userId').equals(userId).primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.playlists, db.notes, db.tombstones, async () => {
    if (stale.length > 0) {
      const deletedAt = Date.now()
      await db.playlists.bulkDelete(stale)
      await db.notes
        .where('[targetType+targetId]')
        .anyOf(stale.map((id) => ['playlist', id]))
        .delete()
      await db.tombstones.bulkPut(
        stale.flatMap((id) => [
          { id: `playlists:${id}`, userId, deletedAt },
          { id: `notes:playlist:${id}`, userId, deletedAt },
        ]),
      )
    }
    await db.playlists.bulkPut(records)
  })
}

export async function syncSetlists(setlists: Setlist[]): Promise<void> {
  const db = getDatabase()
  const userId = activeUserId
  if (db === null || userId === null) {
    return
  }

  const records = setlists.map((setlist) => ({ ...setlist, userId }))
  const ids = new Set(records.map((setlist) => setlist.id))
  const existing = await db.setlists.where('userId').equals(userId).primaryKeys()
  const stale = existing.filter((id) => !ids.has(id))

  await db.transaction('rw', db.setlists, db.tombstones, async () => {
    if (stale.length > 0) {
      const deletedAt = Date.now()
      await db.setlists.bulkDelete(stale)
      await db.tombstones.bulkPut(stale.map((id) => ({ id: `setlists:${id}`, userId, deletedAt })))
    }
    await db.setlists.bulkPut(records)
  })
}

export async function syncNotes(records: Record<string, Note>): Promise<void> {
  const db = getDatabase()
  const userId = activeUserId
  if (db === null || userId === null) {
    return
  }

  const known = new Set<string>()
  for (const track of useLibraryStore.getState().tracks) {
    known.add(noteKey('track', track.id))
  }
  for (const playlist of usePlaylistsStore.getState().playlists) {
    known.add(noteKey('playlist', playlist.id))
  }

  const values = Object.values(records)
    .filter((note) => known.has(noteKey(note.targetType, note.targetId)))
    .map((note) => ({ ...note, userId }))
  const keep = new Set(values.map((note) => noteKey(note.targetType, note.targetId)))
  const existing = await db.notes.where('userId').equals(userId).toArray()
  const stale = existing.filter((note) => !keep.has(noteKey(note.targetType, note.targetId)))

  await db.transaction('rw', db.notes, db.tombstones, async () => {
    if (stale.length > 0) {
      const deletedAt = Date.now()
      await db.notes.bulkDelete(stale.map((note) => [note.targetType, note.targetId]))
      await db.tombstones.bulkPut(
        stale.map((note) => ({
          id: `notes:${noteKey(note.targetType, note.targetId)}`,
          userId,
          deletedAt,
        })),
      )
    }
    await db.notes.bulkPut(values)
  })
}

export async function saveCurrentSession(): Promise<void> {
  const db = getDatabase()
  const userId = activeUserId
  if (db === null || userId === null) {
    return
  }

  const snapshot = usePlayerStore.getState()
  const record: SessionRecord = {
    key: scopeKey(userId),
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
    savedAt: Date.now(),
  }

  await db.session.put(record)
}

/** Borra todos los datos musicales de un usuario (al eliminar su cuenta). */
export async function deleteUserData(userId: string): Promise<void> {
  const db = getDatabase()
  if (db === null) {
    return
  }

  await db.transaction(
    'rw',
    [
      db.songs,
      db.playlists,
      db.session,
      db.analysis,
      db.chords,
      db.setlists,
      db.notes,
      db.lyrics,
      db.authSessions,
      db.users,
      db.tombstones,
    ] as never,
    async () => {
      await db.songs.where('userId').equals(userId).delete()
      await db.playlists.where('userId').equals(userId).delete()
      await db.analysis.where('userId').equals(userId).delete()
      await db.chords.where('userId').equals(userId).delete()
      await db.setlists.where('userId').equals(userId).delete()
      await db.notes.where('userId').equals(userId).delete()
      await db.lyrics.where('userId').equals(userId).delete()
      await db.authSessions.where('userId').equals(userId).delete()
      await db.tombstones.where('userId').equals(userId).delete()
      await db.session.delete(scopeKey(userId))
      await db.users.delete(userId)
    },
  )
}
