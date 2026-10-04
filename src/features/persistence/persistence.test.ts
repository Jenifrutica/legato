import { beforeEach, describe, expect, it } from 'vitest'
import { useLibraryStore } from '../library'
import type { LibraryTrack } from '../library'
import { useTrackAnalysisStore } from '../musician'
import { getDatabase } from './db'
import { recordToTrack, trackToRecord } from './mappers'
import { syncAnalysis } from './persistence'

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
    fileSize: 1024,
    mimeType: 'audio/mpeg',
    dedupeKey: `${id}.mp3:1024:0`,
    addedAt: 0,
    sampleRate: 44100,
    bitrate: 320000,
    codec: 'MP3',
    channels: 2,
  }
}

describe('persistence mappers', () => {
  it('round trip mantiene metadatos, calidad y blob', () => {
    const original = track('a')
    const record = trackToRecord(original)
    const restored = recordToTrack(record)

    expect(restored.id).toBe('a')
    expect(restored.title).toBe('Cancion a')
    expect(restored.sampleRate).toBe(44100)
    expect(restored.bitrate).toBe(320000)
    expect(restored.codec).toBe('MP3')
    expect(restored.channels).toBe(2)
    expect(restored.blob).toBe(record.blob)
    expect(restored.sourceUrl.startsWith('blob:')).toBe(true)
  })
})

describe('persistence database', () => {
  beforeEach(async () => {
    const db = getDatabase()
    if (db !== null) {
      await db.songs.clear()
      await db.playlists.clear()
      await db.session.clear()
      await db.analysis.clear()
    }
    useLibraryStore.getState().hydrate([])
    useTrackAnalysisStore.getState().hydrate([])
  })

  it('guarda y carga canciones con blob', async () => {
    const db = getDatabase()
    expect(db).not.toBeNull()
    if (db === null) {
      return
    }

    await db.songs.put(trackToRecord(track('a')))
    const records = await db.songs.toArray()

    expect(records).toHaveLength(1)
    expect(records[0].blob).toBeDefined()
    expect(records[0].sampleRate).toBe(44100)
  })

  it('guarda playlists y sesion', async () => {
    const db = getDatabase()
    expect(db).not.toBeNull()
    if (db === null) {
      return
    }

    await db.playlists.put({
      id: 'p1',
      name: 'Set',
      createdAt: 1,
      updatedAt: 2,
      trackIds: ['a'],
    })
    await db.session.put({
      key: 'current',
      trackIds: ['a'],
      currentId: 'a',
      currentTime: 12,
      loopMode: 'all',
      shuffle: true,
      volume: 0.5,
      rate: 0.9,
      balance: -0.3,
      channelMode: 'left',
    })

    const playlist = await db.playlists.get('p1')
    const session = await db.session.get('current')

    expect(playlist?.trackIds).toEqual(['a'])
    expect(session?.currentTime).toBe(12)
    expect(session?.loopMode).toBe('all')
    expect(session?.shuffle).toBe(true)
    expect(session?.balance).toBe(-0.3)
    expect(session?.channelMode).toBe('left')
  })

  it('guarda y carga el análisis por pista', async () => {
    const db = getDatabase()
    expect(db).not.toBeNull()
    if (db === null) {
      return
    }

    await db.analysis.put({ trackId: 'a', bpm: 128, key: 'Dm', updatedAt: 1 })
    const record = await db.analysis.get('a')

    expect(record?.bpm).toBe(128)
    expect(record?.key).toBe('Dm')
  })

  it('syncAnalysis descarta pistas que ya no están en la biblioteca', async () => {
    const db = getDatabase()
    expect(db).not.toBeNull()
    if (db === null) {
      return
    }

    useLibraryStore.getState().hydrate([track('a')])
    await syncAnalysis({
      a: { trackId: 'a', bpm: 120, key: null, updatedAt: 1 },
      ghost: { trackId: 'ghost', bpm: 90, key: null, updatedAt: 1 },
    })

    const keys = await db.analysis.toCollection().primaryKeys()
    expect(keys).toEqual(['a'])
  })
})
