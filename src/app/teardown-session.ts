import { usePlayLogStore } from '../features/capsule'
import { useHistoryStore } from '../features/history'
import { useMetronomeStore, useMicStore } from '../features/musician'
import {
  resetStores,
  saveCurrentSession,
  setActiveUserId,
  stopPersistence,
} from '../features/persistence'
import { setSpotifyScope, useSpotifyStore } from '../features/sources'
import { stopCloudSync } from '../features/sync'
import { useAudioFxStore, usePlayerStore } from '../player'

/**
 * Cierre de sesión completo: guarda al usuario saliente, apaga todos los
 * runtimes (micro, metrónomo, ambiente, Spotify, reproductor) y vacía el
 * estado transitorio para que la siguiente cuenta no herede nada.
 * Las preferencias de dispositivo (tema, idioma, ambiente elegido, BPM del
 * metrónomo) se conservan.
 */
export function teardownSession(): void {
  // Primero se guarda y finaliza lo del usuario activo…
  void saveCurrentSession()
  useMicStore.getState().stop()

  // …y después se apagan motores y se limpia el estado.
  stopCloudSync()
  useMetronomeStore.getState().stop()
  useAudioFxStore.getState().stopAmbientPlayback()
  useSpotifyStore.getState().disconnect()
  usePlayerStore.getState().clearSession()
  useHistoryStore.getState().clear()

  stopPersistence()
  resetStores()

  setActiveUserId(null)
  setSpotifyScope(null)
  usePlayLogStore.getState().setScope(null)
}
