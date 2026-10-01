import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function adminReady() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export function getFirebaseAdmin(): { app: App; auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore>; storage: ReturnType<typeof getStorage> } {
  if (!adminReady()) throw new Error('Firebase Admin configuration is missing.');
  const app = getApps()[0] ?? initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  return { app, auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
}
