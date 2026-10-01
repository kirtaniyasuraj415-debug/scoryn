"use client";

import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getFirebaseClient } from '@/lib/firebase/client';

export async function ensureClientWorkspace(user: User) {
  const { db } = getFirebaseClient();
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);

  if (existing.exists() && existing.data()?.defaultWorkspaceId) {
    return existing.data().defaultWorkspaceId as string;
  }

  const workspaceId = `ws_${user.uid}`;
  const workspaceRef = doc(db, 'workspaces', workspaceId);
  const memberRef = doc(db, 'workspaceMembers', `${workspaceId}_${user.uid}`);
  const brandingRef = doc(db, 'branding', workspaceId);

  const batch = writeBatch(db);
  batch.set(userRef, {
    uid: user.uid,
    email: user.email ?? null,
    name: user.displayName ?? null,
    defaultWorkspaceId: workspaceId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  batch.set(workspaceRef, {
    name: user.displayName ? `${user.displayName}'s Agency` : 'My Agency',
    ownerId: user.uid,
    plan: 'FREE',
    auditLimit: 3,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  batch.set(memberRef, {
    workspaceId,
    userId: user.uid,
    role: 'OWNER',
    createdAt: serverTimestamp()
  }, { merge: true });

  batch.set(brandingRef, {
    workspaceId,
    agencyName: user.displayName ? `${user.displayName}'s Agency` : 'My Agency',
    primaryColor: '#C51D6F',
    reportLanguage: 'ENGLISH',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  await batch.commit();
  return workspaceId;
}
