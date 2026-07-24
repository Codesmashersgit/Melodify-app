<div align="center">
  <img src="./client/src/assets/melodify.png" alt="Melodify Logo" width="200" />
  
  # 🎵 Melodify
  
  ### **The Ultimate AI-Powered Music Streaming Platform**
  *Stream. Discover. Feel the Music.*

  <p>
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Platform-Android%20%7C%20Web-brightgreen?style=flat-square" alt="Platform" />
    <img src="https://img.shields.io/badge/Audio-320kbps_HQ-orange?style=flat-square" alt="Audio Quality" />
    <img src="https://img.shields.io/badge/Auth-Google_OAuth_2.0-blue?style=flat-square" alt="Auth" />
    <img src="https://img.shields.io/badge/AI-Gemini_2.5_Flash-purple?style=flat-square" alt="AI" />
  </p>
</div>

---

## 🌟 What is Melodify?

**Melodify** is a premium, full-stack, cross-platform music streaming application available on both **Web** and **Android**. It provides an ad-free, infinite catalog of music by integrating seamlessly with the JioSaavn API — giving you access to millions of Bollywood, Hollywood, Indie, Lo-Fi, K-Pop, Sufi, and more tracks, all at **320kbps high-quality audio**.

What truly sets Melodify apart is its **Google Gemini AI integration** — just speak or type your current mood (in Hindi or English!), and Melodify instantly curates the perfect playlist for you. No manual searching needed.

Whether you're on your browser or on your Android phone, Melodify delivers a consistent, beautiful, and powerful music experience.

---

## 🎨 Project Gallery

### 🖥️ Web UI

<div align="center">
  <h4>✨ Landing Page</h4>
  <img src="./client/src/assets/Screenshot 2026-07-03 122815.png" alt="Landing Page" width="600"/>
  <br/>
  <h4>🎶 Popular Albums</h4>
  <img src="./client/src/assets/Screenshot 2026-07-03 122830.png" alt="Popular Albums" width="600"/>
  <br/>
  <h4>🔍 Search Functionality</h4>
  <img src="./client/src/assets/Screenshot 2026-07-03 122901.png" alt="Search Functionality" width="600"/>
  <br/>
  <h4>🎤 Artist Collection</h4>
  <img src="./client/src/assets/Screenshot 2026-07-03 132721.png" alt="Artist Collection" width="600"/>
  <br/>
  <h4>▶️ Playing Music</h4>
  <img src="./client/src/assets/Screenshot 2026-07-03 132748.png" alt="Playing Music" width="600"/>
</div>

### 📱 Mobile UI

<div align="center">
  <h4>✨ Mobile Views</h4>
  <table>
    <tr>
      <td align="center">
        <img src="./client/src/assets/WhatsApp Image 2026-07-03 at 12.07.38.jpeg" width="250" alt="Mobile Landing Page"/>
        <br/><sub><b>Home Screen</b></sub>
      </td>
      <td align="center">
        <img src="./client/src/assets/WhatsApp Image 2026-07-03 at 12.07.27.jpeg" width="250" alt="Mobile Dashboard"/>
        <br/><sub><b>Now Playing</b></sub>
      </td>
    </tr>
  </table>
</div>

---

## ✨ Feature Highlights

### 🎧 Seamless Audio Experience
- **320kbps HD Streaming** — Crystal-clear audio from JioSaavn CDN, direct to your ears
- **Background Playback** — Music never stops even when you lock your phone or switch apps (powered by `react-native-track-player` and `react-native-music-control`)
- **Lock Screen Controls** — Play, pause, skip — all from your notification shade or lock screen
- **Smart URL Resolution** — Multi-strategy fallback system ensures songs always load:
  - Strategy 1: Pure-JS DES-ECB decryption of JioSaavn encrypted URLs
  - Strategy 2: Parallel fetch from 4 third-party JioSaavn API mirrors
  - Strategy 3/4: Search fallback by song name + artist

### 🧠 Smart AI Voice & Mood Search
- **Speak Your Vibe** — Tap 🎤 and say what you feel (supports Indian accents, Hindi + English)
  - *"Aaj bahut sad lag raha hai"* → Melodify fetches the most soulful sad songs
  - *"I need high energy workout music"* → Boom! Energetic beats incoming
- **Gemini 2.5 Flash Powered** — Google's most capable AI model understands context, mood, emotion, and language in real time
- **Live Voice Transcription** — See what you're saying typed out in real-time in the search bar as you speak
- **Text AI Search** — Prefer typing? Use the ✨ button to describe your mood in text
- **Voice in English Script** — Even when you speak Hindi, the transcription appears in English letters (Hinglish) for cleaner searching

### 🔍 Advanced Search
- **Real-time Suggestions** — Songs, artists, and albums appear as you type
- **Microphone Search** — Voice search triggers auto-search the moment you finish speaking
- **Category Browsing** — Explore curated genre categories (Bollywood, LoFi, Romantic, Sad, Party, etc.)
- **Artist Pages** — Deep dive into any artist's full discography

### 🎛️ Personalized Experience
- **Genre & Language Preferences** — Set your favourite genres (Bollywood, HipHop, Indie, K-Pop, Jazz, Classical, Sufi...) and languages (Hindi, English, Punjabi, Tamil, Telugu, Marathi...)
- **Smart Home Screen** — Automatically adapts sections based on your saved preferences
- **Liked Songs** — Heart any song to save it. Access your entire liked collection anytime
- **Playlists** — Create unlimited personal playlists. Duplicate names are automatically prevented
- **Recently Played** — Jump back into your last listening session instantly

### 🔐 Authentication
- **Google OAuth 2.0** — One-tap sign-in with your Google account (no Firebase!)
- **Email + Password** — Traditional registration and login
- **Full-Screen Authenticating Loader** — Beautiful animated loader while signing in
- **Secure Sessions** — JWT tokens stored in HTTP-only cookies with proper CORS handling
- **Admin Panel** — Dedicated admin dashboard with user stats, song metrics, and feedback management

### 📱 Mobile-Specific Features
- **Full Player Screen** — Immersive now-playing UI with album art, lyrics, progress bar, and controls
- **Mini Player** — Persistent mini player at the bottom while browsing
- **Swipe to Dismiss** — Swipe down to collapse the full player
- **Haptic Feedback** — Subtle vibrations on key interactions
- **Add to Playlist Sheet** — Bottom sheet to quickly add songs to any playlist

---

## 🛠️ Technology Stack

### Frontend — Web (`/client`)
| Technology | Purpose |
|:---|:---|
| **React 18** | Core web framework |
| **Vite** | Lightning-fast dev server & bundler |
| **React Router v6** | Client-side routing |
| **@react-oauth/google** | Direct Google OAuth 2.0 (no Firebase) |
| **Axios** | HTTP client for API calls |
| **Web Speech API** | Browser-native voice recognition |
| **Vanilla CSS** | Custom premium styling (glassmorphism, animations) |

### Frontend — Mobile (`/mobile`)
| Technology | Purpose |
|:---|:---|
| **React Native 0.76+** | Cross-platform mobile framework |
| **Expo SDK 54** | Development toolchain & native modules |
| **React Navigation v7** | Stack + Bottom Tab navigation |
| **react-native-track-player** | Background audio + lock screen controls |
| **expo-speech-recognition** | Voice search with Indian accent support |
| **expo-av** | Video playback for music videos |
| **react-native-music-control** | Notification media controls |

### Backend (`/server`)
| Technology | Purpose |
|:---|:---|
| **Node.js v22** | JavaScript runtime |
| **Express.js 5** | Web server framework |
| **PostgreSQL** | Production database (users, playlists, liked songs) |
| **SQLite** | Local fallback database |
| **JWT (jsonwebtoken)** | Secure token-based authentication |
| **bcryptjs** | Password hashing |
| **Google Gemini AI SDK** | AI mood search (`@google/genai`) |
| **Pure-JS DES-ECB** | Custom decryption for JioSaavn URLs (no OpenSSL dependency) |
| **axios** | Parallel API fetching strategies |
| **yt-search** | YouTube video search for music videos |

---

## 📂 Project Structure

```text
Melodify/
│
├── client/                       # 🌐 React Web App (Vite)
│   ├── src/
│   │   ├── components/           # UI Components
│   │   │   ├── Login.jsx         # Google OAuth + Email login
│   │   │   ├── Signup.jsx        # User registration
│   │   │   ├── Home.jsx          # Main home page with sections
│   │   │   ├── Search.jsx        # Search + Voice + AI mood search
│   │   │   ├── Player.jsx        # Music player controls
│   │   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   │   ├── LikedSongs.jsx    # Liked songs collection
│   │   │   ├── Preferences.jsx   # Genre & language preferences
│   │   │   ├── Playlist.jsx      # Playlist detail view
│   │   │   ├── ArtistPage.jsx    # Artist profile & tracks
│   │   │   └── AdminPanel.jsx    # Admin dashboard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication state & Google OAuth
│   │   │   └── PlaybackContext.jsx # Global audio playback state
│   │   ├── config.js             # API base URL configuration
│   │   └── main.jsx              # App entry point with GoogleOAuthProvider
│   ├── index.html
│   └── package.json
│
├── mobile/                       # 📱 React Native (Expo) App
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── FullPlayerScreen.js   # Full-screen now playing
│   │   │   ├── MiniPlayer.js         # Mini bottom player
│   │   │   ├── TrackCard.js          # Song list item
│   │   │   ├── AddToPlaylistSheet.js # Playlist bottom sheet
│   │   │   └── ...
│   │   ├── screens/              # App screens
│   │   │   ├── HomeScreen.js     # Main home with personalized sections
│   │   │   ├── SearchScreen.js   # Search + voice + AI mood
│   │   │   ├── ProfileScreen.js  # User profile & settings
│   │   │   ├── LibraryScreen.js  # User playlists & liked songs
│   │   │   └── PreferencesScreen.js # Genre/language selector
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Auth state management
│   │   │   └── PlaybackContext.js # Playback state & controls
│   │   └── config.js             # Server IP configuration
│   ├── app.json                  # Expo config (permissions, plugins)
│   └── package.json
│
├── server/                       # ⚙️ Node.js Express Backend
│   ├── index.js                  # Main server — API routes, DES decryption, AI
│   ├── routes.js                 # User routes — auth, playlists, liked songs
│   ├── db.js                     # Database abstraction (PostgreSQL/SQLite)
│   ├── hq_url_cache.json         # Persistent song URL cache
│   ├── package.json
│   └── .env                      # Secrets (GEMINI_API_KEY, JWT_SECRET, DB_URL)
│
└── README.md                     # 📖 You are here
```

---

## 🚀 Getting Started — Run Locally

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9+
- **PostgreSQL** (or SQLite for local dev)
- A **Google Gemini API Key** (free at [aistudio.google.com](https://aistudio.google.com))
- A **Google OAuth 2.0 Client ID** (for web login)

---

### 1️⃣ Start the Backend Server

```bash
cd server
npm install

# Create your .env file
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "JWT_SECRET=your_super_secret_key" >> .env
echo "DATABASE_URL=postgresql://user:password@localhost:5432/melodify" >> .env
# (skip DATABASE_URL to use local SQLite)

# Start the server
npm start
```
> ✅ Server will be live at `http://localhost:5000`

> 💡 **Note:** Melodify uses a **pure-JavaScript DES-ECB decryption** engine — no OpenSSL legacy provider needed. Works perfectly on Node.js v22+.

---

### 2️⃣ Start the Web App

```bash
cd client
npm install
npm run dev
```
> ✅ Web app will be live at `http://localhost:5173`

> ⚙️ Make sure `client/src/config.js` points to `http://localhost:5000`

---

### 3️⃣ Start the Mobile App

> ⚠️ Melodify uses powerful native modules (Voice Recognition, Background Audio). It **cannot** run in standard Expo Go. You must build a custom dev client or APK.

```bash
cd mobile
npm install

# Update src/config.js with your machine's local IP address
# Example: const API_BASE_URL = "http://192.168.1.5:5000";

# Build Android APK using EAS
npx eas build -p android --profile preview
```
> Once built, download and install the APK on your Android device. 🎶

---

## 🔑 Environment Variables

### `server/.env`
```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:password@localhost:5432/melodify
PORT=5000
```

### `client/.env` (optional)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## 🔒 Security & Architecture Notes

- **No Firebase** — Authentication is handled directly via Google OAuth 2.0 (`@react-oauth/google`) and JWT cookies
- **HTTP-only Cookies** — JWT tokens are stored as secure, HTTP-only cookies preventing XSS attacks
- **DES Decryption** — JioSaavn's encrypted media URLs are decrypted using a custom pure-JavaScript DES-ECB implementation — fully compatible with Node.js v17+ / v22+ without any OpenSSL legacy mode
- **Duplicate Prevention** — Server-side check prevents creating playlists with the same name (case-insensitive)
- **CORS Hardening** — Strict origin allowlist with credentials support

---

## 🧩 Key API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/search?query=` | Search songs, artists, albums |
| `GET` | `/api/stream?id=&name=&artist=` | Resolve + redirect to HQ audio CDN URL |
| `GET` | `/api/top-tracks` | Fetch trending/top songs |
| `GET` | `/api/recommendations?seed=` | AI-powered recommendations |
| `GET` | `/api/album/:id` | Album details & tracks |
| `GET` | `/api/artist/:id/tracks` | Artist's songs |
| `GET` | `/api/video?q=` | YouTube music video search |
| `GET` | `/api/ai-mood?mood=` | Gemini AI mood-based song fetch |
| `POST` | `/api/auth/google` | Google OAuth sign-in |
| `POST` | `/api/auth/register` | Email/password registration |
| `POST` | `/api/auth/login` | Email/password login |
| `GET` | `/api/user/liked-songs` | Get user's liked songs |
| `POST` | `/api/user/liked-songs` | Like a song |
| `DELETE` | `/api/user/liked-songs/:id` | Unlike a song |
| `GET` | `/api/user/playlists` | Get user's playlists |
| `POST` | `/api/user/playlists` | Create new playlist |
| `POST` | `/api/user/playlists/:id/songs` | Add song to playlist |

---

## 💡 Developer Notes & Known Fixes

- **React Native New Architecture** — `@react-native-voice/voice` has compatibility issues with New Architecture. This is fixed by setting `"newArchEnabled": false` in `app.json` via `expo-build-properties`
- **DES Decryption on Node v22+** — OpenSSL 3.0 dropped legacy DES-ECB support. Melodify uses a custom pure-JS DES implementation instead of `crypto.createDecipheriv`, ensuring compatibility on all modern Node.js versions
- **Google OAuth CORS** — Fetching Google user profile uses native `fetch()` (not Axios) to avoid credential-related CORS preflight failures with `www.googleapis.com`
- **Voice Search Language** — Set to `en-IN` so Indian-accented speech is transcribed in English/Hinglish letters, making JioSaavn searches more accurate
- **Silent 401 Handling** — The `/api/user/me` session check uses `validateStatus` to accept 401 as a valid response, preventing red console errors for logged-out users
- **Playlist Deduplication** — On server startup, `db.js` auto-cleans duplicate playlist rows keeping only the latest entry per `(user_id, lowercase_name)` pair

---

## 🗺️ Roadmap / Upcoming Features

- [ ] 🎵 Lyrics display (synced with playback)
- [ ] 🌍 Offline download & cache support
- [ ] 🔁 Crossfade & gapless playback
- [ ] 📊 Listening history & stats dashboard
- [ ] 🎙️ Podcast support
- [ ] 🌙 Sleep timer
- [ ] 🤝 Social — share playlists with friends
- [ ] 🍎 iOS app support

---

<div align="center">
  <br/>
  <img src="./client/src/assets/melodify.png" alt="Melodify" width="80" />
  <br/>
  <b>Built with ❤️ by Sudhanshu Raj</b>
  <br/>
  <sub>Melodify — Where AI Meets Music 🎵</sub>
</div>