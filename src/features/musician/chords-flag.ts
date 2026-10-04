const STORAGE_KEY = 'legato.chords.auto'

/**
 * La detección automática de acordes (local, Spotify y micrófono) queda
 * archivada tras esta bandera apagada por defecto: el detector clásico no da
 * acordes fiables en música real y se reserva para el futuro. El editor manual
 * ChordPro funciona siempre.
 */
export function isChordsAutoEnabled(): boolean {
  if (typeof localStorage === 'undefined') {
    return false
  }

  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}
