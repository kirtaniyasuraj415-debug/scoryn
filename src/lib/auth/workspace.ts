import { getFirebaseAdmin } from '@/lib/firebase/admin';

export async function ensureUserWorkspace(uid: string, email?: string | null, name?: string | null) {
  const { db } = getFirebaseAdmin();
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (userSnap.exists && userSnap.data()?.defaultWorkspaceId) return userSnap.data()!.defaultWorkspaceId as string;

  const workspaceRef = db.collection('workspaces').doc();
  const memberRef = db.collection('workspaceMembers').doc(`${workspaceRef.id}_${uid}`);
  const brandingRef = db.collection('branding').doc(workspaceRef.id);
  const now = new Date();

  const batch = db.batch();
  batch.set(userRef, { uid, email: email ?? null, name: name ?? null, defaultWorkspaceId: workspaceRef.id, createdAt: now, updatedAt: now }, { merge: true });
  batch.set(workspaceRef, { name: name ? `${name}'s Agency` : 'My Agency', ownerId: uid, plan: 'FREE', auditLimit: 3, createdAt: now, updatedAt: now });
  batch.set(memberRef, { workspaceId: workspaceRef.id, userId: uid, role: 'OWNER', createdAt: now });
  batch.set(brandingRef, { workspaceId: workspaceRef.id, agencyName: name ? `${name}'s Agency` : 'My Agency', primaryColor: '#C51D6F', reportLanguage: 'ENGLISH', createdAt: now, updatedAt: now });
  await batch.commit();
  return workspaceRef.id;
}

export async function getDefaultWorkspaceId(uid: string) {
  const { db } = getFirebaseAdmin();
  const snap = await db.collection('users').doc(uid).get();
  const id = snap.data()?.defaultWorkspaceId;
  if (!id) return ensureUserWorkspace(uid, snap.data()?.email, snap.data()?.name);
  return id as string;
}
