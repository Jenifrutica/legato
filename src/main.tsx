import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { getMicAnalyser, useMicStore } from './features/musician'
import { wipeLocalData } from './features/persistence'
import { handleSpotifyRedirect } from './features/sources'
import { getAnalyser, getMediaElement, usePlayerStore } from './player'
import './styles/index.css'

/**
 * Recuperación sin entrar a la app: `?reset=1` borra los datos locales y
 * recarga. Útil si una biblioteca enorme deja la interfaz bloqueada.
 */
async function recoverIfRequested(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search)
  if (params.get('reset') !== '1') {
    return false
  }

  try {
    await wipeLocalData()
  } catch {
    // sin almacenamiento local
  }

  const url = new URL(window.location.href)
  url.searchParams.delete('reset')
  window.location.replace(url.toString())
  return true
}

if (import.meta.env.DEV) {
  // Enganche de depuración solo en desarrollo (pruebas manuales de audio).
  ;(window as Window & { __legato?: unknown }).__legato = {
    getAnalyser,
    getMediaElement,
    getMicAnalyser,
    useMicStore,
    usePlayerStore,
  }
}

void recoverIfRequested().then((recovering) => {
  if (recovering) {
    return
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

  void handleSpotifyRedirect()
})

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}
