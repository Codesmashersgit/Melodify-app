import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PlaybackProvider } from './context/PlaybackContext'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <PlaybackProvider>
        <App />
      </PlaybackProvider>
    </AuthProvider>
  </React.StrictMode>,
)
