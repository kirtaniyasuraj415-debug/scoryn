import { cookies } from 'next/headers';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { verifyFirebaseIdToken } from '@/lib/auth/verify-id-token';

export const SESSION_COOKIE='scoryn_session';
export const ID_TOKEN_SESSION_PREFIX='id:';

export async function getServerUser(){
  const store=await cookies();
  const session=store.get(SESSION_COOKIE)?.value;
  if(!session) return null;

  if(session.startsWith(ID_TOKEN_SESSION_PREFIX)){
    return verifyFirebaseIdToken(session.slice(ID_TOKEN_SESSION_PREFIX.length));
  }

  try{
    const {auth}=getFirebaseAdmin();
    const decoded=await auth.verifySessionCookie(session,true);
    return {
      uid:decoded.uid,
      email:typeof decoded.email==='string'?decoded.email:undefined,
      name:typeof decoded.name==='string'?decoded.name:undefined,
      picture:typeof decoded.picture==='string'?decoded.picture:undefined
    };
  }catch{
    // Backwards-compatible fallback in case an ID token was stored without a prefix.
    return verifyFirebaseIdToken(session);
  }
}

export async function requireServerUser(){
  const user=await getServerUser();
  if(!user) throw new Error('UNAUTHENTICATED');
  return user;
}
