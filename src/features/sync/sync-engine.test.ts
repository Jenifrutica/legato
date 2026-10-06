import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLibraryStore } from '../library'
import { getDatabase, setActiveUserId, trackToRecord } from '../persistence'
import { usePlaylistsStore } from '../playlists'
import type { LibraryTrack } from '../library'
import { startCloudSync, stopCloudSync, syncNow } from './sync-engine'
import { useSyncStore } from './sync-store'
import type { CloudBackend, SyncRecord, SyncTable, SyncTombstone } from './types'

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
    blob: new Blob(['audio!'], { type: 'audio/mpeg' }),
    fileName: `${id}.mp3`,
    fileSize: 6,
    mimeType: 'audio/mpeg',
    dedupeKey: `${id}:6:0`,
    addedAt: 1,
    updatedAt: 1,
    sampleRate: null,
    bitrate: null,
    codec: null,
    channels: null,
  }
}

function memoryBackend(seed: Partial<Record<SyncTable, SyncRecord[]>> = {}) {
  const data = new Map<SyncTable, Map<string, SyncRecord>>()
  const tombstones = new Map<string, SyncTombstone>()
  const files = new Map<string, Blob>()
  const removed: Array<{ table: SyncTable; id: string }> = []

  for (const [table, records] of Object.entries(seed)) {
    data.set(table as SyncTable, new Map((records ?? []).map((record) => [record.id, record])))
  }

  const backend: CloudBackend = {
    pull: async (_uid, table) => [...(data.get(table)?.values() ?? [])],
    push: async (_uid, table, records) => {
      const map = data.get(table) ?? new Map<string, SyncRecord>()
      for (const record of records) {
        map.set(record.id, record)
      }
      data.set(table, map)
    },
    remove: async (_uid, table, ids) => {
      const map = data.get(table)
      for (const id of ids) {
        map?.delete(id)
        removed.push({ table, id })
      }
    },
    pullTombstones: async () => [...tombstones.values()],
    pushTombstones: async (_uid, list) => {
      for (const tombstone of list) {
        tombstones.set(tombstone.id, tombstone)
      }
    },
    uploadFile: async (path, blob) => {
      files.set(path, blob)
    },
    downloadFile: async (path) => files.get(path) ?? null,
    removeFile: async (path) => {
      files.delete(path)
    },
  }

  return { backend, data, tombstones, files, removed }
}

async function resetDatabase() {
  const db = getDatabase()
  if (db !== null) {
    await Promise.all([
      db.songs.clear(),
      db.playlists.clear(),
      db.session.clear(),
      db.analysis.clear(),
      db.chords.clear(),
      db.notes.clear(),
      db.lyrics.clear(),
      db.tombstones.clear(),
    ])
  }
  useLibraryStore.getState().hydrate([])
  usePlaylistsStore.getState().hydrate([], [])
}

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:test')
  URL.revokeObjectURL = vi.fn()
})

describe('sync-engine', () => {
  beforeEach(async () => {
    await resetDatabase()
    setActiveUserId('u1')
    useSyncStore.setState({ enabled: true, status: 'idle' })
  })

  afterEach(() => {
    stopCloudSync()
    setActiveUserId(null)
  })

  it('baja lo remoto que no existe en local y lo hidrata', async () => {
    const { backend } = memoryBackend({
      playlists: [
        {
          id: 'p-remota',
          updatedAt: 5,
          payload: {
            id: 'p-remota',
            name: 'Remota',
            createdAt: 1,
            updatedAt: 5,
            trackIds: [],
          },
        },
      ],
    })

    await startCloudSync('u1', backend)

    expect(usePlaylistsStore.getState().playlists.map((item) => item.id)).toEqual(['p-remota'])
    const stored = await getDatabase()?.playlists.get('p-remota')
    expect(stored?.userId).toBe('u1')
    expect(useSyncStore.getState().status).toBe('idle')
  })

  it('aplica lápidas remotas y sube las locales', async () => {
    const db = getDatabase()
    expect(db).not.toBeNull()
    if (db === null) {
      return
    }
    await db.songs.put(trackToRecord(track('mía'), 'u1'))

    const { backend, tombstones, removed } = memoryBackend()
    tombstones.set('songs:mía', { id: 'songs:mía', deletedAt: Date.now() })

    await startCloudSync('u1', backend)

    expect(await db.songs.get('mía')).toBeUndefined()
    expect(useLibraryStore.getState().tracks).toHaveLength(0)
    expect(removed.some((item) => item.table === 'songs' && item.id === 'mía')).toBe(true)
    expect((await db.tombstones.get('songs:mía'))?.userId).toBe('u1')
  })

  it('descarga el audio de una canción remota y lo deja reproducible', async () => {
    const payload = {
      id: 'r1',
      title: 'Remota',
      artist: 'Alguien',
      album: null,
      durationSeconds: 10,
      fileName: 'r1.mp3',
      fileSize: 3,
      mimeType: 'audio/mpeg',
      dedupeKey: 'r1:3:0',
      addedAt: 1,
      updatedAt: 5,
      sampleRate: null,
      bitrate: null,
      codec: null,
      channels: null,
      hasAudio: true,
      hasArtwork: false,
    }
    const { backend, files } = memoryBackend({
      songs: [{ id: 'r1', updatedAt: 5, payload }],
    })
    files.set('users/u1/songs/r1', new Blob(['abc'], { type: 'audio/mpeg' }))

    await startCloudSync('u1', backend)

    const stored = await getDatabase()?.songs.get('r1')
    expect(stored?.userId).toBe('u1')
    expect(useLibraryStore.getState().tracks.map((item) => item.id)).toEqual(['r1'])
  })

  it('syncNow manual no rompe sin backend', async () => {
    await expect(syncNow()).resolves.toBeUndefined()
  })
})
