import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { hydrateStores, startPersistence } from './features/persistence'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

void hydrateStores().then((hydrated) => {
  if (hydrated) {
    startPersistence()
  }
})
