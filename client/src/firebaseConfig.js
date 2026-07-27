import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD5M9VdKAh7Z8pWjiwCY0Z01Q46z2mdLEQ",
  authDomain: "melodify-efb4e.firebaseapp.com",
  projectId: "melodify-efb4e",
  storageBucket: "melodify-efb4e.firebasestorage.app",
  messagingSenderId: "145321546112",
  appId: "1:145321546112:web:8eecbb22b52bc09c75f165",
  measurementId: "G-F2VJR4DQ3B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
