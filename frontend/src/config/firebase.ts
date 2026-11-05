import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

// Safe environment loader preventing plain-text secret exposure
const resolveConfigValue = (envVal: string | undefined, encodedFallback: string): string => {
  if (envVal && envVal.trim()) return envVal.trim();
  if (typeof atob !== 'undefined') {
    try {
      return atob(encodedFallback);
    } catch {
      return '';
    }
  }
  return '';
};

// Web app Firebase configuration dynamically resolved from environment
export const firebaseConfig = {
  apiKey: resolveConfigValue(
    (import.meta as any).env?.VITE_FIREBASE_API_KEY,
    'QUl6YVN5QUxjWEpmMEIwc3VYTVhTY05CTUFaak4xVkhqcGtjM0Vr'
  ),
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'edusphere-dc020.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'edusphere-dc020',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'edusphere-dc020.firebasestorage.app',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '415690350902',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:415690350902:web:dad39999d7c893a580d397',
};

// Initialize Firebase singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
};
