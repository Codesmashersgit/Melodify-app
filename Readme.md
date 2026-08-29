<div align="center">
  <img src="./client/src/assets/melodify.png" alt="Melodify Logo" width="200" style={{ borderRadius: "50%" }} />
  
  # 🎵 Melodify
  
  ### **The Ultimate AI-Powered Music Streaming Platform**
  *Stream. Discover. Feel the Music.*

  <p>
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  </p>

  <p>
    <strong><a href="https://melodify18--07nwo4vjif.expo.app/">Live Web App Demo</a></strong> •
    <strong><a href="#-getting-started--run-locally">Getting Started</a></strong> •
    <strong><a href="#-key-api-endpoints">API Docs</a></strong>
  </p>
</div>

---

## ✨ Features

Melodify is a full-stack, cross-platform music streaming ecosystem featuring a **React Web App**, a **React Native Mobile App (Android/iOS)**, and a scalable **Node.js/PostgreSQL Backend**.

- **🤖 AI-Powered Discoveries** — Seamlessly integrates with Google Gemini AI to curate playlists based on real-time mood descriptions (e.g., "I want to relax after a long day").
- **🎥 Automatic Official Music Videos** — Switches dynamically from audio to the official YouTube music video if audio streaming fails or upon user request.
- **📱 True Cross-Platform** — Native mobile app built with Expo, and a blazing-fast responsive Web app built with React + Vite.
- **🎙️ Voice Search** — Native device voice recognition (English/Hinglish) mapped directly to search queries.
- **🔐 Secure Authentication** — Google OAuth 2.0 and JWT-based authentication using HTTP-only cookies.
- **🎛️ Premium Admin Dashboard** — Built-in admin panel to manage users, monitor analytics, and dynamically push UI configuration updates (like Festival modes) instantly to all clients.
- **⚡ Custom Decryption Engine** — Completely custom, pure-JavaScript DES-ECB engine to stream encrypted CDN audio in real-time, bypassing OpenSSL 3.0 legacy mode limitations on modern Node environments.

---

## 🏗️ Monorepo Architecture

```bash
Melodify/
├── client/                       # 🌐 React Web App (Vite)
│   ├── src/
│   │   ├── components/           # UI Components (Sidebar, Player, AdminPanel)
│   │   ├── context/              # Auth & Playback State
│   │   └── App.jsx               # Routing (React Router)
│   └── package.json
│
├── mobile/                       # 📱 React Native (Expo) App
│   ├── src/
│   │   ├── components/           # FullPlayerScreen, MiniPlayer, Sheets
│   │   ├── screens/              # HomeScreen, SearchScreen, ProfileScreen
│   │   └── context/              # Mobile Playback & Auth State
│   └── app.json                  # Expo config (permissions, Android 15+ fixes)
│
├── server/                       # ⚙️ Node.js Express Backend
│   ├── index.js                  # Core server, AI routes, DES engine
│   ├── routes.js                 # User, Playlist, Auth, Admin routes
│   ├── db.js                     # PostgreSQL / SQLite Abstraction
│   └── .env                      # Secrets (GEMINI_KEY, JWT, DB_URL)
│
└── README.md                     # 📖 Documentation
```

---

## 🚀 Getting Started — Run Locally

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- **PostgreSQL** (Production) or SQLite (Local Dev fallback)
- **Google Gemini API Key** (Free at [aistudio.google.com](https://aistudio.google.com))
- **Google OAuth 2.0 Client ID**

### 1️⃣ Start the Backend Server

```bash
cd server
npm install

# Configure your environment
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "JWT_SECRET=your_super_secret_key" >> .env
echo "DATABASE_URL=postgresql://user:password@localhost:5432/melodify" >> .env

# Start the server
npm start
```
> ✅ Server runs on `http://localhost:5000`

### 2️⃣ Start the Web App

```bash
cd client
npm install
npm run dev
```
> ✅ Web app runs on `http://localhost:5173`. Ensure `client/src/config.js` points to `http://localhost:5000`.

### 3️⃣ Start the Mobile App

> ⚠️ **Note:** Melodify uses powerful native modules (Background Audio, Voice Recognition). It must be compiled as a custom dev client or standalone APK via EAS.

```bash
cd mobile
npm install

# Update src/config.js with your Local IPv4 address (e.g., http://192.168.1.5:5000)

# Build Android APK locally or via cloud
npx eas build -p android --profile preview
```

---

## 🔑 Environment Variables

**`server/.env`**
```env
GEMINI_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:pass@localhost:5432/melodify
PORT=5000
```

**`client/.env`** (Optional, falls back to config.js)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id
```

---

## 🔒 Security & Developer Notes

- **JWT + HTTP-Only Cookies:** Auth state is managed via secure cookies protecting against XSS attacks. No tokens are exposed to local storage.
- **Custom DES Decryption:** OpenSSL 3.0 (Node 17+) dropped legacy DES-ECB. Melodify uses a bespoke JS implementation for decrypting JioSaavn media URLs, ensuring perfect compatibility across all host environments.
- **Android 14/15 Background Media:** Expo AV strict mode checks have been hardened. App intelligently manages foreground service constraints to prevent random OS-level strict mode kills on modern Android versions.
- **Deduplication Engine:** The backend uses an automated sanitization pass to prevent duplicate user playlists and orphaned liked songs upon boot.
- **CORS Hardening:** Strict origin allowlists with native `fetch()` utilized for Google Profile resolution to bypass preflight constraints.

---

## 🧩 Key API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/search?query=` | Search across tracks, artists, and albums |
| `GET` | `/api/stream?id=&name=` | Decrypts and redirects to HQ audio CDN |
| `GET` | `/api/recommendations` | AI-powered personalized recommendations |
| `GET` | `/api/ai-mood?mood=` | Translates human mood to a song playlist |
| `POST` | `/api/auth/google` | OAuth sign-in / Registration |
| `GET` | `/api/user/liked-songs` | Retrieve user library |
| `GET` | `/api/admin/stats` | Retrieve platform-wide metrics (Admin only) |

---

## 🗺️ Roadmap / Upcoming Features

- [ ] 🎵 **Lyrics Sync** — Real-time lyrics scrolling.
- [ ] 🌍 **Offline Mode** — Encrypted local caching for downloaded songs.
- [ ] 🔁 **Gapless Playback** — Audio crossfading for a DJ-like experience.
- [ ] 🤝 **Social Sharing** — Share playlists via deep-linking.
- [ ] 🍎 **iOS App Store Release** — Optimizing UI/UX for iOS safe areas.

---

<div align="center">
  <br/>
  <b>Built with ❤️ by Sudhanshu Raj</b>
  <br/>
  <sub>Melodify — Where AI Meets Music 🎵</sub>
</div>