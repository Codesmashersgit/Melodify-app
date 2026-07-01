# Melodify Mobile (React Native + Expo)

Welcome to the mobile version of your music app! 

### Folder Structure Overview
- `src/api/`: Use this for your Axios requests. 
  - **TIP**: Mention your PC IP instead of `localhost` so the phone can connect to the backend server.
- `src/components/`: Reusable UI elements (`TrackRow`, `Player`, `Button`).
- `src/context/`: Copy your `PlaybackContext.jsx` here (logic is almost same).
- `src/navigation/`: Set up your Bottom Tabs here.
- `src/screens/`: Main screens like `HomeScreen`, `SearchScreen`, `ArtistScreen`.

### Next Steps to Run:
1.  Open your terminal in this `mobile` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Install mobile-specific libraries (Recommended):
    ```bash
    npx expo install expo-av @react-navigation/native @react-navigation/bottom-tabs react-native-safe-area-context react-native-screens
    ```
4.  Start the app:
    ```bash
    npx expo start
    ```
5.  Scan the QR code with your phone (Exposed via Expo Go app) and see the magic!

---
To build the **APK**, use the `eas build` steps shared in the chat.
