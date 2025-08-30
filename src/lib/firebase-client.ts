import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD2YKDX4AlhIEYjYvH1GAKiurkEgtSpKuU",
  authDomain: "portochallange.firebaseapp.com",
  databaseURL: "https://portochallange-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "portochallange",
  storageBucket: "portochallange.appspot.com",
  messagingSenderId: "640207146057",
  appId: "1:640207146057:web:9af814599944829fc38398",
};

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
