import { getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyAFHPAgBKZcxR5yqfmJ-iLTvxTwZXFncOo',
  authDomain: 'scoryn-f9c53.firebaseapp.com',
  projectId: 'scoryn-f9c53',
  storageBucket: 'scoryn-f9c53.firebasestorage.app',
  messagingSenderId: '943764683277',
  appId: '1:943764683277:web:82962e055111403d29f344',
  measurementId: 'G-DZ9Z9RVGZ0'
} as const;

export function firebaseClientReady() {
  return true;
}

export function getFirebaseClient() {
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app)
  };
}

export async function getFirebaseAnalytics() {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported();
  if (!supported) return null;
  const { app } = getFirebaseClient();
  return getAnalytics(app);
}
