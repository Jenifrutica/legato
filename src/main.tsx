import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { getMicAnalyser, useMicStore } from './features/musician'
import { handleSpotifyRedirect } from './features/sources'
import { getAnalyser, getMediaElement, usePlayerStore } from './player'
import './styles/index.css'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

void handleSpotifyRedirect()

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}
