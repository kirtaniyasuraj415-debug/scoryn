import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { ensureUserWorkspace } from '@/lib/auth/workspace';
import { SESSION_COOKIE } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    const { auth } = getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(idToken);
    await ensureUserWorkspace(decoded.uid, decoded.email, decoded.name);
    const expiresIn = 1000 * 60 * 60 * 24 * 5;
    const session = await auth.createSessionCookie(idToken, { expiresIn });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, session, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: expiresIn / 1000 });
    return res;
  } catch { return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 }); }
}
export async function DELETE(){const res=NextResponse.json({ok:true});res.cookies.set(SESSION_COOKIE,'',{httpOnly:true,expires:new Date(0),path:'/'});return res}
