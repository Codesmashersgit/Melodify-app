<div align="center">
  <img src="https://img.icons8.com/color/120/000000/music.png" alt="Melodify Logo" />
  
  # 🎵 Melodify
  
  **The Ultimate AI-Powered Music Streaming Experience**

  <p>
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" /></a>
  </p>
</div>

---

## 🌟 What is Melodify?

Melodify is a premium, full-stack music streaming application. It provides an ad-free, infinite catalog of music by integrating seamlessly with the JioSaavn API. What sets Melodify apart is its **Google Gemini AI integration**, allowing users to search for music based purely on their current mood or vibe using natural language voice commands!

---

## ✨ Amazing Features

### 🎧 Seamless Audio Experience
- **High-Quality Streaming:** Enjoy uninterrupted 320kbps HD audio.
- **Background Playback:** Full support for background audio and lock-screen media controls using `react-native-track-player` and `react-native-music-control`.
- **Dynamic Equalizer & Micro-Animations:** A beautiful, responsive UI that feels alive while your music plays.

### 🧠 Smart AI Voice Search
- **Talk to Melodify:** Tap the 🎤 icon and say how you feel (e.g., *"Aaj bahut sad lag raha hai"* or *"I need workout energy"*).
- **Gemini Powered:** The backend leverages Google Gemini 2.5 Flash to instantly understand your mood and fetch the perfect personalized playlist.
- **Text AI Search:** Prefer typing? Type your mood and hit the ✨ button for the same magical results.

### 🎛️ Personalized Dynamic Preferences
- **Your Vibe, Front & Center:** The Home Screen automatically adapts to your saved preferences (Bollywood, Lofi, EDM, etc.).
- **Infinite Scrolling:** Browse Top Hits, New Releases, and Trending Albums tailored just for you.

### 🔐 Robust Backend Engine
- **Direct CDN Streaming:** The Express backend securely decrypts JioSaavn's DES-encrypted media URLs and streams them directly to the client with zero proxy lag.
- **Smart Fallbacks:** If a high-quality link fails, the backend automatically uses parallel fetching strategies to ensure the music never stops.

---

## 🛠️ Technology Stack

| Frontend (Mobile) | Backend (Server) | AI & External APIs |
| :--- | :--- | :--- |
| **React Native** (0.76+) | **Node.js** (v18+) | **Google Gemini AI** |
| **Expo** (SDK 54) | **Express.js** | **JioSaavn API** |
| React Navigation v7 | `axios` | |
| `@react-native-voice/voice` | `crypto-js` (DES Decryption) | |
| `expo-av` | `dotenv` | |

---

## 📂 Project Structure

```text
Melodify/
├── mobile/                  # 📱 React Native (Expo) Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI (TrackCard, Skeletons, Player)
│   │   ├── context/         # React Context (AuthContext, PlaybackContext)
│   │   ├── screens/         # App Screens (Home, Search, Player, Profile)
│   │   └── config.js        # Server IP Configuration
│   ├── app.json             # Expo config (Custom permissions & plugins)
│   └── package.json
│
├── server/                  # ⚙️ Node.js Express Backend
│   ├── index.js             # API routes, Decryption Logic, AI Integration
│   ├── package.json
│   └── .env                 # Secrets (GEMINI_API_KEY)
│
└── Readme.md                # 📖 You are here
```

---

## 🚀 How to Run Locally

### 1️⃣ Start the Backend Server

The backend requires Node.js and a Gemini API Key to run.

```bash
cd server
npm install

# Create a .env file
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "BASE_URL=http://localhost:5000" >> .env

# Start the server (Uses legacy OpenSSL provider for crypto-js decryption)
npm start
```
*Server will be live at `http://localhost:5000`*

### 2️⃣ Start the Mobile App

Because Melodify uses powerful native modules (like Voice Recognition and Background Audio), **it cannot run in the standard Expo Go app**. You must compile an APK or use an EAS Development Client.

```bash
cd mobile
npm install

# ⚠️ Important: Update src/config.js to point to your backend's IP address!
# Example: const API_BASE_URL = "http://192.168.1.5:5000";

# Build the Android APK using Expo Application Services (EAS)
npx eas build -p android --profile preview
```

Once the build is complete, download the APK, install it on your Android phone, and experience the magic of Melodify! 🎶

---

## 💡 Developer Notes & Known Fixes
- **Gradle Build Issue with Voice Module:** The `@react-native-voice/voice` package currently has issues with React Native's New Architecture. To fix this, `"newArchEnabled": false` has been explicitly set in `app.json` via the `expo-build-properties` plugin.
- **Audio Decryption:** The JioSaavn API returns DES-encrypted URLs. The backend handles this decryption locally using `crypto-js`. 

---

<div align="center">
  <b>Built with ❤️ by sk_rungta & Antigravity</b>
</div>