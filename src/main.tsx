import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { hydrateStores, startPersistence } from './features/persistence'
import { handleSpotifyRedirect } from './features/sources'
import './styles/index.css'

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
