import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PlaybackProvider } from './context/PlaybackContext'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  console.warn("⚠️ VITE_GOOGLE_CLIENT_ID is not configured in your client .env file!");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <PlaybackProvider>
          <App />
        </PlaybackProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
