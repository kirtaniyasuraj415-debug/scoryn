import { cookies } from 'next/headers';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export const SESSION_COOKIE = 'scoryn_session';

export async function getServerUser() {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  try {
    const { auth } = getFirebaseAdmin();
    return await auth.verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

export async function requireServerUser() {
  const user = await getServerUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}
