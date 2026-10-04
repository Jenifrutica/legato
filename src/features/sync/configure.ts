import { readAuthEnv } from '../auth'
import { createFirebaseBackend } from './firebase-backend'
import { startCloudSync, stopCloudSync } from './sync-engine'
import { useSyncStore } from './sync-store'

/**
 * Arranca o para la sincronización según el usuario, el toggle y la
 * configuración de Firebase (si falta, la app funciona solo en local).
 */
export function configureCloudSync(userId: string | null): void {
  const env = readAuthEnv()
  const enabled = useSyncStore.getState().enabled

  if (userId === null || !enabled || env.firebase === undefined) {
    stopCloudSync()
    return
  }

  startCloudSync(userId, createFirebaseBackend(env.firebase))
}
