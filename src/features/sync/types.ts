export const SYNC_TABLES = [
  'songs',
  'playlists',
  'session',
  'analysis',
  'chords',
  'setlists',
  'notes',
  'lyrics',
] as const

export type SyncTable = (typeof SYNC_TABLES)[number]

export type SyncRecord = {
  id: string
  updatedAt: number
  payload: Record<string, unknown>
}

export type SyncTombstone = {
  id: string
  deletedAt: number
}

export type CloudBackend = {
  pull: (uid: string, table: SyncTable) => Promise<SyncRecord[]>
  push: (uid: string, table: SyncTable, records: SyncRecord[]) => Promise<void>
  remove: (uid: string, table: SyncTable, ids: string[]) => Promise<void>
  pullTombstones: (uid: string) => Promise<SyncTombstone[]>
  pushTombstones: (uid: string, tombstones: SyncTombstone[]) => Promise<void>
  uploadFile: (path: string, blob: Blob) => Promise<void>
  downloadFile: (path: string) => Promise<Blob | null>
  removeFile: (path: string) => Promise<void>
}

export function audioPath(uid: string, songId: string): string {
  return `users/${uid}/songs/${songId}`
}

export function artworkPath(uid: string, songId: string): string {
  return `users/${uid}/artwork/${songId}`
}
