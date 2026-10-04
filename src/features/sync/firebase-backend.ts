import { getApps, initializeApp } from 'firebase/app'
import type { FirebaseConfig } from '../auth/firebase-auth-provider'
import type { CloudBackend, SyncRecord, SyncTable, SyncTombstone } from './types'

const BATCH_SIZE = 400

function clean(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(clean)
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) {
        result[key] = clean(entry)
      }
    }
    return result
  }
  return value
}

/** Backend de sincronización sobre Firestore (metadatos) y Storage (archivos). */
export function createFirebaseBackend(config: FirebaseConfig): CloudBackend {
  const app =
    getApps().find((candidate) => candidate.name === 'legato') ?? initializeApp(config, 'legato')

  let firestoreModule: typeof import('firebase/firestore') | null = null
  let storageModule: typeof import('firebase/storage') | null = null

  async function firestore() {
    firestoreModule ??= await import('firebase/firestore')
    return firestoreModule
  }

  async function storageLib() {
    storageModule ??= await import('firebase/storage')
    return storageModule
  }

  async function database() {
    const { getFirestore } = await firestore()
    return getFirestore(app)
  }

  return {
    async pull(uid: string, table: SyncTable): Promise<SyncRecord[]> {
      const { collection, getDocs } = await firestore()
      const snapshot = await getDocs(collection(await database(), 'users', uid, table))
      return snapshot.docs.map((document) => {
        const data = document.data() as { updatedAt?: number; payload?: Record<string, unknown> }
        return {
          id: document.id,
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
          payload: data.payload ?? {},
        }
      })
    },

    async push(uid: string, table: SyncTable, records: SyncRecord[]): Promise<void> {
      if (records.length === 0) {
        return
      }
      const { doc, writeBatch } = await firestore()
      const db = await database()
      for (let start = 0; start < records.length; start += BATCH_SIZE) {
        const batch = writeBatch(db)
        for (const record of records.slice(start, start + BATCH_SIZE)) {
          batch.set(doc(db, 'users', uid, table, record.id), {
            updatedAt: record.updatedAt,
            payload: clean(record.payload),
          })
        }
        await batch.commit()
      }
    },

    async remove(uid: string, table: SyncTable, ids: string[]): Promise<void> {
      if (ids.length === 0) {
        return
      }
      const { doc, writeBatch } = await firestore()
      const db = await database()
      for (let start = 0; start < ids.length; start += BATCH_SIZE) {
        const batch = writeBatch(db)
        for (const id of ids.slice(start, start + BATCH_SIZE)) {
          batch.delete(doc(db, 'users', uid, table, id))
        }
        await batch.commit()
      }
    },

    async pullTombstones(uid: string): Promise<SyncTombstone[]> {
      const { collection, getDocs } = await firestore()
      const snapshot = await getDocs(collection(await database(), 'users', uid, 'tombstones'))
      return snapshot.docs.map((document) => {
        const data = document.data() as { deletedAt?: number }
        return {
          id: document.id,
          deletedAt: typeof data.deletedAt === 'number' ? data.deletedAt : 0,
        }
      })
    },

    async pushTombstones(uid: string, tombstones: SyncTombstone[]): Promise<void> {
      if (tombstones.length === 0) {
        return
      }
      const { doc, writeBatch } = await firestore()
      const db = await database()
      for (let start = 0; start < tombstones.length; start += BATCH_SIZE) {
        const batch = writeBatch(db)
        for (const tombstone of tombstones.slice(start, start + BATCH_SIZE)) {
          batch.set(doc(db, 'users', uid, 'tombstones', tombstone.id), {
            deletedAt: tombstone.deletedAt,
          })
        }
        await batch.commit()
      }
    },

    async uploadFile(path: string, blob: Blob): Promise<void> {
      const { getStorage, ref, uploadBytes } = await storageLib()
      await uploadBytes(ref(getStorage(app), path), blob)
    },

    async downloadFile(path: string): Promise<Blob | null> {
      try {
        const { getBlob, getStorage, ref } = await storageLib()
        return await getBlob(ref(getStorage(app), path))
      } catch {
        return null
      }
    },

    async removeFile(path: string): Promise<void> {
      try {
        const { deleteObject, getStorage, ref } = await storageLib()
        await deleteObject(ref(getStorage(app), path))
      } catch {
        // el archivo ya no existe
      }
    },
  }
}
