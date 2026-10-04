import { useLibraryStore } from '../library'
import { useLocalLyricsStore } from '../lyrics'
import { useChordStore, useNotesStore, useSetlistStore, useTrackAnalysisStore } from '../musician'
import { usePlaylistsStore } from '../playlists'
import { getActiveUserId, getDatabase, hydrateStores } from '../persistence'
import type {
  AnalysisRecord,
  ChordRecord,
  LyricsRecord,
  NoteRecord,
  PlaylistRecord,
  SessionRecord,
  SetlistRecord,
  SongRecord,
} from '../persistence'
import { usePlayerStore } from '../../player'
import { mergeTable, mergeTombstones } from './merge'
import type { MergePlan } from './merge'
import { useSyncStore } from './sync-store'
import { audioPath, artworkPath, SYNC_TABLES } from './types'
import type { CloudBackend, SyncRecord, SyncTable, SyncTombstone } from './types'

let backend: CloudBackend | null = null
let uid: string | null = null
let unsubscribers: Array<() => void> = []
let pushTimer: ReturnType<typeof setTimeout> | null = null
let syncing = false
let suppressPush = false
const uploadedAudio = new Set<string>()
const uploadedArtwork = new Set<string>()

function scopeKey(userId: string): string {
  return `current:${userId}`
}

/** Firestore sin crear o reglas sin publicar se muestra como «pendiente». */
function reportSyncError(error: unknown): void {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : ''
  const needsSetup =
    code.includes('permission') ||
    code.includes('not-found') ||
    code.includes('failed-precondition') ||
    code.includes('unavailable')

  useSyncStore.setState({
    status: needsSetup ? 'idle' : 'error',
    needsSetup,
    error: needsSetup ? null : 'sync-failed',
    progress: null,
  })
}

function stripUserId(row: Record<string, unknown>): Record<string, unknown> {
  const { userId: _ignored, ...rest } = row
  return rest
}

function tombstoneTable(id: string): string {
  return id.split(':')[0] ?? ''
}

function tombstoneRecordId(id: string): string {
  return id.slice(id.indexOf(':') + 1)
}

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitize)
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) {
        result[key] = sanitize(entry)
      }
    }
    return result
  }
  return value
}

function songPayload(row: SongRecord): Record<string, unknown> {
  const { blob, artwork, userId: _ignored, ...rest } = row
  return sanitize({
    ...rest,
    hasAudio: (blob?.size ?? 0) > 0,
    hasArtwork: artwork !== null && artwork !== undefined && artwork.size > 0,
  }) as Record<string, unknown>
}

function rowFromPayload<T>(_table: SyncTable, payload: Record<string, unknown>, userId: string): T {
  return { ...payload, userId } as T
}

async function readLocalTable(table: SyncTable): Promise<SyncRecord[]> {
  const db = getDatabase()
  const userId = getActiveUserId()
  if (db === null || userId === null) {
    return []
  }

  if (table === 'songs') {
    const rows = await db.songs.where('userId').equals(userId).toArray()
    return rows.map((row) => ({
      id: row.id,
      updatedAt: row.updatedAt ?? row.addedAt,
      payload: songPayload(row),
    }))
  }

  if (table === 'session') {
    const row = await db.session.get(scopeKey(userId))
    if (row === undefined) {
      return []
    }
    return [{ id: 'current', updatedAt: row.savedAt ?? 0, payload: stripUserId({ ...row }) }]
  }

  const mapRow = (row: Record<string, unknown>, id: string, updatedAt: number): SyncRecord => ({
    id,
    updatedAt,
    payload: stripUserId(row),
  })

  switch (table) {
    case 'playlists': {
      const rows = await db.playlists.where('userId').equals(userId).toArray()
      return rows.map((row) =>
        mapRow(row as unknown as Record<string, unknown>, row.id, row.updatedAt),
      )
    }
    case 'analysis': {
      const rows = await db.analysis.where('userId').equals(userId).toArray()
      return rows.map((row) =>
        mapRow(row as unknown as Record<string, unknown>, row.trackId, row.updatedAt),
      )
    }
    case 'chords': {
      const rows = await db.chords.where('userId').equals(userId).toArray()
      return rows.map((row) =>
        mapRow(row as unknown as Record<string, unknown>, row.trackId, row.updatedAt),
      )
    }
    case 'lyrics': {
      const rows = await db.lyrics.where('userId').equals(userId).toArray()
      return rows.map((row) =>
        mapRow(row as unknown as Record<string, unknown>, row.trackId, row.updatedAt),
      )
    }
    case 'setlists': {
      const rows = await db.setlists.where('userId').equals(userId).toArray()
      return rows.map((row) =>
        mapRow(row as unknown as Record<string, unknown>, row.id, row.updatedAt),
      )
    }
    case 'notes': {
      const rows = await db.notes.where('userId').equals(userId).toArray()
      return rows.map((row) =>
        mapRow(
          row as unknown as Record<string, unknown>,
          `${row.targetType}:${row.targetId}`,
          row.updatedAt,
        ),
      )
    }
    default:
      return []
  }
}

async function readLocalTombstones(): Promise<SyncTombstone[]> {
  const db = getDatabase()
  const userId = getActiveUserId()
  if (db === null || userId === null) {
    return []
  }
  const rows = await db.tombstones.where('userId').equals(userId).toArray()
  return rows.map((row) => ({ id: row.id, deletedAt: row.deletedAt }))
}

async function writeLocalTombstones(tombstones: SyncTombstone[]): Promise<void> {
  const db = getDatabase()
  const userId = getActiveUserId()
  if (db === null || userId === null) {
    return
  }
  await db.tombstones.bulkPut(tombstones.map((item) => ({ ...item, userId })))
}

async function downloadSongFiles(
  payload: Record<string, unknown>,
  songId: string,
  userId: string,
): Promise<{ blob: Blob; artwork: Blob | null } | null> {
  if (backend === null) {
    return null
  }

  let blob = new Blob([])
  if (payload.hasAudio === true) {
    const downloaded = await backend.downloadFile(audioPath(userId, songId))
    if (downloaded === null) {
      return null
    }
    blob = downloaded
  }

  let artwork: Blob | null = null
  if (payload.hasArtwork === true) {
    artwork = await backend.downloadFile(artworkPath(userId, songId))
  }

  return { blob, artwork }
}

async function applyPlans(
  plans: Map<SyncTable, MergePlan>,
  tombstones: SyncTombstone[],
  downloadFiles: boolean,
): Promise<void> {
  const db = getDatabase()
  const userId = getActiveUserId()
  if (db === null || userId === null) {
    return
  }

  let done = 0
  const totalSongs = plans.get('songs')?.toApplyLocal.length ?? 0
  if (totalSongs > 0) {
    useSyncStore.setState({ progress: { done: 0, total: totalSongs } })
  }

  // Canciones (con sus blobs).
  const songPlan = plans.get('songs')
  if (songPlan !== undefined) {
    const localSongs = new Map(
      (await db.songs.where('userId').equals(userId).toArray()).map((row) => [row.id, row]),
    )
    for (const id of songPlan.toDeleteLocal) {
      localSongs.delete(id)
      uploadedAudio.delete(id)
      uploadedArtwork.delete(id)
    }
    for (const record of songPlan.toApplyLocal) {
      const existing = localSongs.get(record.id)
      const files = downloadFiles
        ? await downloadSongFiles(record.payload, record.id, userId)
        : { blob: existing?.blob ?? new Blob([]), artwork: existing?.artwork ?? null }
      if (files === null) {
        continue
      }
      const row = {
        ...record.payload,
        id: record.id,
        userId,
        blob: files.blob,
        artwork: files.artwork,
      } as unknown as SongRecord
      localSongs.set(record.id, row)
      done++
      useSyncStore.setState({ progress: { done, total: totalSongs } })
    }
    if (songPlan.toDeleteLocal.length > 0) {
      await db.songs.bulkDelete(songPlan.toDeleteLocal)
    }
    await db.songs.bulkPut([...localSongs.values()])
  }

  // Resto de tablas.
  const simple: Array<[SyncTable, () => Promise<void>]> = [
    [
      'playlists',
      async () => {
        const plan = plans.get('playlists')
        if (plan === undefined) return
        await db.playlists.bulkDelete(plan.toDeleteLocal)
        await db.playlists.bulkPut(
          plan.toApplyLocal.map((record) =>
            rowFromPayload<PlaylistRecord>('playlists', record.payload, userId),
          ),
        )
      },
    ],
    [
      'analysis',
      async () => {
        const plan = plans.get('analysis')
        if (plan === undefined) return
        await db.analysis.bulkDelete(plan.toDeleteLocal)
        await db.analysis.bulkPut(
          plan.toApplyLocal.map((record) =>
            rowFromPayload<AnalysisRecord>('analysis', record.payload, userId),
          ),
        )
      },
    ],
    [
      'chords',
      async () => {
        const plan = plans.get('chords')
        if (plan === undefined) return
        await db.chords.bulkDelete(plan.toDeleteLocal)
        await db.chords.bulkPut(
          plan.toApplyLocal.map((record) =>
            rowFromPayload<ChordRecord>('chords', record.payload, userId),
          ),
        )
      },
    ],
    [
      'lyrics',
      async () => {
        const plan = plans.get('lyrics')
        if (plan === undefined) return
        await db.lyrics.bulkDelete(plan.toDeleteLocal)
        await db.lyrics.bulkPut(
          plan.toApplyLocal.map((record) =>
            rowFromPayload<LyricsRecord>('lyrics', record.payload, userId),
          ),
        )
      },
    ],
    [
      'setlists',
      async () => {
        const plan = plans.get('setlists')
        if (plan === undefined) return
        await db.setlists.bulkDelete(plan.toDeleteLocal)
        await db.setlists.bulkPut(
          plan.toApplyLocal.map((record) =>
            rowFromPayload<SetlistRecord>('setlists', record.payload, userId),
          ),
        )
      },
    ],
    [
      'notes',
      async () => {
        const plan = plans.get('notes')
        if (plan === undefined) return
        await db.notes.bulkDelete(
          plan.toDeleteLocal.map((id) => {
            const [targetType, ...rest] = id.split(':')
            return [targetType ?? '', rest.join(':')]
          }),
        )
        await db.notes.bulkPut(
          plan.toApplyLocal.map((record) =>
            rowFromPayload<NoteRecord>('notes', record.payload, userId),
          ),
        )
      },
    ],
    [
      'session',
      async () => {
        const plan = plans.get('session')
        if (plan === undefined) return
        const applied = plan.toApplyLocal[0]
        if (applied === undefined) return
        const current = usePlayerStore.getState()
        if (current.currentTrack !== null) {
          return
        }
        const row = { ...applied.payload, key: scopeKey(userId) } as SessionRecord
        await db.session.put(row)
        usePlayerStore.getState().restoreSession(row)
      },
    ],
  ]

  for (const [, apply] of simple) {
    await apply()
  }

  await writeLocalTombstones(tombstones)
}

async function pushPlans(
  plans: Map<SyncTable, MergePlan>,
  tombstones: SyncTombstone[],
): Promise<void> {
  const userId = getActiveUserId()
  if (backend === null || userId === null) {
    return
  }

  for (const table of SYNC_TABLES) {
    const plan = plans.get(table)
    if (plan === undefined) {
      continue
    }
    if (plan.toUpload.length > 0) {
      await backend.push(userId, table, plan.toUpload)
    }
    const tombstonedIds = tombstones
      .filter((item) => tombstoneTable(item.id) === table)
      .map((item) => tombstoneRecordId(item.id))
    if (tombstonedIds.length > 0) {
      await backend.remove(userId, table, tombstonedIds)
    }
    if (plan.toDeleteRemote.length > 0) {
      await backend.remove(userId, table, plan.toDeleteRemote)
    }
  }

  await backend.pushTombstones(userId, tombstones)
  await uploadPendingFiles()
}

async function uploadPendingFiles(): Promise<void> {
  const db = getDatabase()
  const userId = getActiveUserId()
  if (db === null || backend === null || userId === null) {
    return
  }

  const songs = await db.songs.where('userId').equals(userId).toArray()
  for (const song of songs) {
    if (song.externalUrl != null) {
      continue
    }
    if (song.blob.size > 0 && !uploadedAudio.has(song.id)) {
      try {
        await backend.uploadFile(audioPath(userId, song.id), song.blob)
        uploadedAudio.add(song.id)
      } catch {
        // cuota o red: se reintentará en el próximo empuje
      }
    }
    if (song.artwork !== null && song.artwork.size > 0 && !uploadedArtwork.has(song.id)) {
      try {
        await backend.uploadFile(artworkPath(userId, song.id), song.artwork)
        uploadedArtwork.add(song.id)
      } catch {
        // se reintentará
      }
    }
  }
}

/** Sincronización completa: baja cambios remotos, los aplica y sube los locales. */
export async function syncNow(options: { downloadFiles?: boolean } = {}): Promise<void> {
  if (backend === null || uid === null || syncing) {
    return
  }

  syncing = true
  suppressPush = true
  useSyncStore.setState({ status: 'syncing', error: null, progress: null })

  try {
    const remoteTombstones = await backend.pullTombstones(uid)
    const tombstones = mergeTombstones(await readLocalTombstones(), remoteTombstones)

    const plans = new Map<SyncTable, MergePlan>()
    const pullResults = await Promise.all(
      SYNC_TABLES.map(async (table) => {
        const [local, remote] = await Promise.all([
          readLocalTable(table),
          backend?.pull(uid as string, table) ?? Promise.resolve([]),
        ])
        const scoped = tombstones
          .filter((item) => tombstoneTable(item.id) === table)
          .map((item) => ({ id: tombstoneRecordId(item.id), deletedAt: item.deletedAt }))
        return [table, mergeTable(local, remote, scoped)] as const
      }),
    )
    for (const [table, plan] of pullResults) {
      plans.set(table, plan)
    }

    await applyPlans(plans, tombstones, options.downloadFiles === true)
    await hydrateStores()
    await pushPlans(plans, tombstones)

    useSyncStore.setState({
      status: 'idle',
      lastSyncAt: Date.now(),
      progress: null,
      error: null,
      needsSetup: false,
    })
  } catch (error) {
    reportSyncError(error)
  } finally {
    syncing = false
    suppressPush = false
  }
}

/** Subida ligera tras un cambio local (debounce desde los stores). */
async function pushLocalChanges(): Promise<void> {
  const userId = getActiveUserId()
  if (backend === null || userId === null || suppressPush || syncing) {
    return
  }

  try {
    const plans = new Map<SyncTable, MergePlan>()
    const records = await Promise.all(SYNC_TABLES.map((table) => readLocalTable(table)))
    SYNC_TABLES.forEach((table, index) => {
      const list = records[index] ?? []
      plans.set(table, {
        toUpload: list,
        toApplyLocal: [],
        toDeleteLocal: [],
        toDeleteRemote: [],
      })
    })
    await pushPlans(plans, await readLocalTombstones())
    useSyncStore.setState({
      status: 'idle',
      lastSyncAt: Date.now(),
      error: null,
      needsSetup: false,
    })
  } catch (error) {
    reportSyncError(error)
  }
}

function schedulePush(): void {
  if (suppressPush || backend === null) {
    return
  }
  if (pushTimer !== null) {
    clearTimeout(pushTimer)
  }
  pushTimer = setTimeout(() => {
    pushTimer = null
    void pushLocalChanges()
  }, 3000)
}

export function startCloudSync(nextUid: string, nextBackend: CloudBackend): Promise<void> {
  stopCloudSync()
  uid = nextUid
  backend = nextBackend
  uploadedAudio.clear()
  uploadedArtwork.clear()

  const stores = [
    useLibraryStore,
    usePlaylistsStore,
    useTrackAnalysisStore,
    useChordStore,
    useSetlistStore,
    useNotesStore,
    useLocalLyricsStore,
    usePlayerStore,
  ]
  unsubscribers = stores.map((store) => store.subscribe(schedulePush))

  useSyncStore.setState({ status: 'idle', error: null })
  return syncNow({ downloadFiles: true })
}

export function stopCloudSync(): void {
  for (const unsubscribe of unsubscribers) {
    unsubscribe()
  }
  unsubscribers = []
  if (pushTimer !== null) {
    clearTimeout(pushTimer)
    pushTimer = null
  }
  backend = null
  uid = null
  syncing = false
  uploadedAudio.clear()
  uploadedArtwork.clear()
  useSyncStore.setState({ status: 'off', progress: null })
}
