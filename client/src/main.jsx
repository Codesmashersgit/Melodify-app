import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PlaybackProvider } from './context/PlaybackContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PlaybackProvider>
      <App />
    </PlaybackProvider>
  </React.StrictMode>,
)
