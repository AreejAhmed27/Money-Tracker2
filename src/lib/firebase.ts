import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "decent-splice-tthv3",
  appId: "1:1039011286172:web:a3faf2d8c62e86dab07159",
  apiKey: "AIzaSyA5HgQguXjPXYPgUXHNNVX-gCSYEpUzxG4",
  authDomain: "decent-splice-tthv3.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-moneytracker-37fde659-670d-406e-998d-b93b4f8fb8b4",
  storageBucket: "decent-splice-tthv3.firebasestorage.app",
  messagingSenderId: "1039011286172",
  measurementId: "",
  oAuthClientId: "1039011286172-dslq7kil7ol5modpq9phjm8fh817m06q.apps.googleusercontent.com",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// Ensure persistent authentication
setPersistence(auth, browserLocalPersistence).catch(() => {});

// Use databaseId from config if provided, otherwise default
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
export default app;
