import { getApps, initializeApp } from 'firebase/app'
import type { FirebaseConfig } from '../auth/firebase-auth-provider'
import { base64ToBytes, bytesToBase64, fileIdFromPath, joinBytes, splitBytes } from './file-chunks'
import type { FileManifest } from './file-chunks'
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

function chunkDocId(fileId: string, index: number): string {
  return `${fileId}__${String(index).padStart(4, '0')}`
}

/**
 * Backend de sincronización sobre Firestore: metadatos por colección y
 * archivos troceados en documentos (`fileManifests` + `fileChunks`), sin
 * necesidad de Firebase Storage.
 */
export function createFirebaseBackend(config: FirebaseConfig): CloudBackend {
  const app =
    getApps().find((candidate) => candidate.name === 'legato') ?? initializeApp(config, 'legato')

  let firestoreModule: typeof import('firebase/firestore') | null = null

  async function firestore() {
    firestoreModule ??= await import('firebase/firestore')
    return firestoreModule
  }

  async function database() {
    const { getFirestore } = await firestore()
    return getFirestore(app)
  }

  /** Borra manifiesto y trozos existentes de un archivo. */
  async function deleteFileDocuments(uid: string, path: string): Promise<void> {
    const { collection, doc, getDocs, query, where, writeBatch } = await firestore()
    const db = await database()
    const fileId = fileIdFromPath(path)
    const snapshot = await getDocs(
      query(
        collection(db, 'users', uid, 'fileChunks'),
        where('__name__', '>=', `${fileId}__`),
        where('__name__', '<=', `${fileId}__\uf8ff`),
      ),
    )

    const refs = snapshot.docs.map((document) => document.ref)
    for (let start = 0; start < refs.length; start += BATCH_SIZE) {
      const batch = writeBatch(db)
      for (const ref of refs.slice(start, start + BATCH_SIZE)) {
        batch.delete(ref)
      }
      await batch.commit()
    }

    await batchDeleteDocs(db, [doc(db, 'users', uid, 'fileManifests', fileId)])
  }

  async function batchDeleteDocs(
    db: Awaited<ReturnType<typeof database>>,
    refs: Array<import('firebase/firestore').DocumentReference>,
  ): Promise<void> {
    const { writeBatch } = await firestore()
    for (let start = 0; start < refs.length; start += BATCH_SIZE) {
      const batch = writeBatch(db)
      for (const ref of refs.slice(start, start + BATCH_SIZE)) {
        batch.delete(ref)
      }
      await batch.commit()
    }
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
      const { doc, writeBatch } = await firestore()
      const db = await database()
      const uid = path.split('/')[1] ?? ''
      const bytes = new Uint8Array(await blob.arrayBuffer())
      const chunks = splitBytes(bytes)
      const fileId = fileIdFromPath(path)

      await deleteFileDocuments(uid, path)

      const manifest: FileManifest = {
        size: bytes.length,
        mime: blob.type,
        chunks: chunks.length,
      }

      const entries: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }> = [
        {
          ref: doc(db, 'users', uid, 'fileManifests', fileId),
          data: manifest as unknown as Record<string, unknown>,
        },
        ...chunks.map((chunk, index) => ({
          ref: doc(db, 'users', uid, 'fileChunks', chunkDocId(fileId, index)),
          data: { data: bytesToBase64(chunk) },
        })),
      ]

      for (let start = 0; start < entries.length; start += BATCH_SIZE) {
        const batch = writeBatch(db)
        for (const entry of entries.slice(start, start + BATCH_SIZE)) {
          batch.set(entry.ref, entry.data)
        }
        await batch.commit()
      }
    },

    async downloadFile(path: string): Promise<Blob | null> {
      const { doc, getDoc } = await firestore()
      const db = await database()
      const uid = path.split('/')[1] ?? ''
      const fileId = fileIdFromPath(path)

      const manifestSnap = await getDoc(doc(db, 'users', uid, 'fileManifests', fileId))
      if (!manifestSnap.exists()) {
        return null
      }

      const manifest = manifestSnap.data() as FileManifest
      const parts: Uint8Array<ArrayBuffer>[] = []
      for (let index = 0; index < manifest.chunks; index++) {
        const chunkSnap = await getDoc(
          doc(db, 'users', uid, 'fileChunks', chunkDocId(fileId, index)),
        )
        if (!chunkSnap.exists()) {
          return null
        }
        const chunkData = chunkSnap.data() as { data?: string }
        parts.push(base64ToBytes(chunkData.data ?? ''))
      }

      return new Blob([joinBytes(parts)], { type: manifest.mime })
    },

    async removeFile(path: string): Promise<void> {
      const uid = path.split('/')[1] ?? ''
      await deleteFileDocuments(uid, path)
    },
  }
}
