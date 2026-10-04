import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { hydrateStores, startPersistence } from './features/persistence'
import { handleSpotifyRedirect } from './features/sources'
import { getAnalyser, getMediaElement, usePlayerStore } from './player'
import './styles/index.css'

if (import.meta.env.DEV) {
  // Enganche de depuración solo en desarrollo (pruebas manuales de audio).
  ;(window as Window & { __legato?: unknown }).__legato = {
    getAnalyser,
    getMediaElement,
    usePlayerStore,
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

void handleSpotifyRedirect()

void hydrateStores().then((hydrated) => {
  if (hydrated) {
    startPersistence()
  }
})

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}
