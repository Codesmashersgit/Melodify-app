import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PlaybackProvider } from './context/PlaybackContext'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = "145321546112-8ejiegssa746e3rlnn4ihhhmi69sgqao.apps.googleusercontent.com";

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
