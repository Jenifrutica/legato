import type { SyncRecord, SyncTombstone } from './types'

export type MergePlan = {
  /** Registros locales que hay que subir (nuevos o más recientes). */
  toUpload: SyncRecord[]
  /** Registros remotos que hay que aplicar en local. */
  toApplyLocal: SyncRecord[]
  /** Ids locales que hay que borrar (lápidas). */
  toDeleteLocal: string[]
  /** Ids remotos que hay que borrar (lápidas). */
  toDeleteRemote: string[]
}

function tombstoneMap(tombstones: SyncTombstone[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const tombstone of tombstones) {
    const previous = map.get(tombstone.id) ?? 0
    map.set(tombstone.id, Math.max(previous, tombstone.deletedAt))
  }
  return map
}

/** Une lápidas locales y remotas quedándose con el borrado más reciente. */
export function mergeTombstones(local: SyncTombstone[], remote: SyncTombstone[]): SyncTombstone[] {
  const map = tombstoneMap([...local, ...remote])
  return [...map.entries()]
    .map(([id, deletedAt]) => ({ id, deletedAt }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Fusiona una tabla entre local y remoto con “gana la edición más reciente”
 * y respeta las lápidas de borrado (no resucita lo eliminado en otro equipo).
 */
export function mergeTable(
  local: SyncRecord[],
  remote: SyncRecord[],
  tombstones: SyncTombstone[],
): MergePlan {
  const deleted = tombstoneMap(tombstones)
  const localById = new Map(local.map((record) => [record.id, record]))
  const remoteById = new Map(remote.map((record) => [record.id, record]))
  const ids = new Set([...localById.keys(), ...remoteById.keys()])

  const plan: MergePlan = {
    toUpload: [],
    toApplyLocal: [],
    toDeleteLocal: [],
    toDeleteRemote: [],
  }

  for (const id of ids) {
    const localRecord = localById.get(id)
    const remoteRecord = remoteById.get(id)
    const deletedAt = deleted.get(id)

    if (
      deletedAt !== undefined &&
      deletedAt >= (localRecord?.updatedAt ?? 0) &&
      deletedAt >= (remoteRecord?.updatedAt ?? 0)
    ) {
      if (localRecord !== undefined) {
        plan.toDeleteLocal.push(id)
      }
      if (remoteRecord !== undefined) {
        plan.toDeleteRemote.push(id)
      }
      continue
    }

    if (localRecord !== undefined && remoteRecord === undefined) {
      plan.toUpload.push(localRecord)
      continue
    }
    if (localRecord === undefined && remoteRecord !== undefined) {
      plan.toApplyLocal.push(remoteRecord)
      continue
    }
    if (localRecord !== undefined && remoteRecord !== undefined) {
      if (localRecord.updatedAt >= remoteRecord.updatedAt) {
        plan.toUpload.push(localRecord)
      } else {
        plan.toApplyLocal.push(remoteRecord)
      }
    }
  }

  return plan
}
