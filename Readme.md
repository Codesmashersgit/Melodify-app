# 🎵 Melodify

Melodify is a full-stack, AI-powered music streaming application built with **React Native (Expo)** on the frontend and **Node.js (Express)** on the backend. It leverages the JioSaavn API for an infinite catalog of music and integrates Google Gemini AI for smart, mood-based voice search and dynamic music recommendations.

---

## 🌟 Key Features

### 🎧 Frontend (Mobile App)
- **High-Quality Audio Playback:** Full background audio support with lock-screen controls using `react-native-track-player` and `react-native-music-control`.
- **Dynamic Preferences:** The Home Screen dynamically adapts its content sections based on the user's selected preferences (e.g., Bollywood, Hollywood, Lofi).
- **AI Voice Search ✨:** Tap the microphone icon or type how you feel (e.g., "I want to party" or "Aaj mera mood sad hai"). Google Gemini AI breaks down the context and fetches the perfect playlist for your mood.
- **Slick UI/UX:** Built with a premium, responsive dark/light mode design featuring smooth micro-animations, equalizer animations, and skeleton loading states.
- **User Authentication & Profiles:** Manage your profile, select music preferences, and get personalized recommendations.

### ⚙️ Backend (Server)
- **JioSaavn API Integration:** Fetches high-quality (320kbps) audio streams, top charts, artist details, and album information in real-time.
- **DES Decryption Engine:** Securely decrypts encrypted media URLs from the JioSaavn CDN to serve direct, uninterrupted audio streams to the mobile app.
- **Google Gemini AI Endpoint:** Features a dedicated `/api/ai-mood` endpoint that interprets natural language user moods and converts them into highly optimized search queries.
- **Smart Fallbacks:** Implements multiple stream resolution strategies (including parallel API fetching and search fallbacks) to ensure songs always play.

---

## 🛠️ Technology Stack

**Mobile Frontend:**
- React Native & Expo SDK 54
- React Navigation (Bottom Tabs & Native Stack)
- `@react-native-voice/voice` for Speech-to-Text
- `expo-av` & `react-native-track-player` for Audio
- AsyncStorage for local caching

**Backend:**
- Node.js & Express.js
- `axios` for JioSaavn API communication
- `crypto-js` for DES decryption
- `@google/genai` (Gemini 2.5 Flash) for AI mood analysis

---

## 📂 Project Structure

```
Melodify/
├── mobile/                  # React Native (Expo) Frontend
│   ├── src/
│   │   ├── components/      # UI components (TrackCard, Skeletons, Player)
│   │   ├── context/         # AuthContext, PlaybackContext
│   │   ├── screens/         # HomeScreen, SearchScreen, PlayerScreen, etc.
│   │   └── config.js        # API Base URL configuration
│   ├── app.json             # Expo configuration (Permissions, SDK versions)
│   └── package.json
│
├── server/                  # Node.js Express Backend
│   ├── index.js             # Main server logic, JioSaavn proxy, AI endpoints
│   ├── package.json
│   └── .env                 # Environment variables (GEMINI_API_KEY)
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- EAS CLI (`npm install -g eas-cli`) for building the APK
- A Google Gemini API Key

### 1. Setting up the Backend
```bash
cd server
npm install

# Create a .env file and add your Gemini API Key
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "BASE_URL=http://your_local_ip:5000" >> .env

# Start the server (Requires legacy OpenSSL provider for decryption)
npm start
```
The server will start on `http://localhost:5000`.

### 2. Setting up the Mobile App
*Note: Due to native modules like `@react-native-voice/voice` and `react-native-track-player`, the app must be built into an APK (it will crash in Expo Go).*

```bash
cd mobile
npm install

# Update src/config.js with your backend's IP address (if running locally) or your deployed Render URL.
# Example: const API_BASE_URL = "http://192.168.1.5:5000";

# Build the Android APK using EAS
npx eas build -p android --profile preview
```

Once the build finishes, install the APK on your Android device and enjoy!

---

## ⚠️ Known Issues & Fixes
- **Gradle Build Failure on Android:** The `@react-native-voice/voice` module does not fully support the New Architecture (Fabric). This has been mitigated by setting `"newArchEnabled": false` in `app.json`.
- **Expo Go Incompatibility:** Voice search and background audio playback utilize native code. Test these features on a physical device using a development build or the compiled APK.

---

*Built with ❤️ and 🎵 by sk_rungta.*