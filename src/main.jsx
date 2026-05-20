import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import * as Storage from './storage.js'

// Hydrate the in-memory storage cache from @capacitor/preferences before
// React mounts. Otherwise useState(() => Storage.get(...)) initializers
// race the async hydration and every component starts with empty data.
//
// On iOS device this reads from UserDefaults; on web (Vite dev) it reads
// from localStorage. Either way the cache is populated before render.
Storage.init().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
