import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { ID_TOKEN_SESSION_PREFIX, SESSION_COOKIE } from '@/lib/auth/session';
import { verifyFirebaseIdToken } from '@/lib/auth/verify-id-token';

const FIVE_DAYS=60*60*24*5;
const ID_TOKEN_FALLBACK_SECONDS=50*60;

export async function POST(req:Request){
  try{
    const body=await req.json().catch(()=>({}));
    const idToken=typeof body?.idToken==='string'?body.idToken:'';
    if(!idToken){
      return NextResponse.json({error:'Missing sign-in token.'},{status:400});
    }

    const verified=await verifyFirebaseIdToken(idToken);
    if(!verified){
      return NextResponse.json({error:'Sign-in expired or invalid. Please try again.'},{status:401});
    }

    let cookieValue=ID_TOKEN_SESSION_PREFIX+idToken;
    let maxAge=ID_TOKEN_FALLBACK_SECONDS;
    let mode:'firebase-session'|'id-token-fallback'='id-token-fallback';

    try{
      const {auth}=getFirebaseAdmin();
      cookieValue=await auth.createSessionCookie(idToken,{expiresIn:FIVE_DAYS*1000});
      maxAge=FIVE_DAYS;
      mode='firebase-session';
    }catch(e){
      // A verified Firebase ID token is safe to use as a short-lived httpOnly
      // fallback. This prevents a valid client login from failing just because
      // Firebase Admin cannot mint a long-lived session cookie.
      console.warn('[Scoryn auth] Long-lived session cookie unavailable; using verified short session.',e);
    }

    const res=NextResponse.json({ok:true,mode});
    res.cookies.set(SESSION_COOKIE,cookieValue,{
      httpOnly:true,
      secure:process.env.NODE_ENV==='production',
      sameSite:'lax',
      path:'/',
      maxAge
    });
    return res;
  }catch(e){
    console.error('[Scoryn auth] Session endpoint failed.',e);
    return NextResponse.json({error:'Could not finish sign-in. Please try again.'},{status:500});
  }
}

export async function DELETE(){
  const res=NextResponse.json({ok:true});
  res.cookies.set(SESSION_COOKIE,'',{
    httpOnly:true,
    secure:process.env.NODE_ENV==='production',
    sameSite:'lax',
    expires:new Date(0),
    path:'/'
  });
  return res;
}
