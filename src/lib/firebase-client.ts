import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// NOTE: Do NOT commit sensitive keys. Add the real values to a local `.env.local` file
// (which should be in .gitignore). If these values were committed to the repo,
// rotate them in the Firebase console.

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development only when explicitly enabled
const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === 'true';

if (useEmulator && typeof window !== 'undefined') {
  // Attempt to connect to local emulators if available. Use try/catch to avoid errors.
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    // console.debug('Auth emulator not connected', error);
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // console.debug('Firestore emulator not connected', error);
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // console.debug('Storage emulator not connected', error);
  }
}

export default app;
