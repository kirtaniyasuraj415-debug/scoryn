import { getFirebaseAdmin } from '@/lib/firebase/admin';

export type ScorynServerUser={
  uid:string;
  email?:string;
  name?:string;
  picture?:string;
};

const FIREBASE_WEB_API_KEY=process.env.NEXT_PUBLIC_FIREBASE_API_KEY||'AIzaSyAFHPAgBKZcxR5yqfmJ-iLTvxTwZXFncOo';

async function verifyWithIdentityToolkit(idToken:string):Promise<ScorynServerUser|null>{
  try{
    const res=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({idToken}),
      cache:'no-store'
    });
    if(!res.ok) return null;
    const data:any=await res.json();
    const user=data?.users?.[0];
    if(!user?.localId) return null;
    return {
      uid:String(user.localId),
      email:typeof user.email==='string'?user.email:undefined,
      name:typeof user.displayName==='string'?user.displayName:undefined,
      picture:typeof user.photoUrl==='string'?user.photoUrl:undefined
    };
  }catch{
    return null;
  }
}

export async function verifyFirebaseIdToken(idToken:string):Promise<ScorynServerUser|null>{
  if(!idToken) return null;

  try{
    const {auth}=getFirebaseAdmin();
    const decoded=await auth.verifyIdToken(idToken);
    return {
      uid:decoded.uid,
      email:typeof decoded.email==='string'?decoded.email:undefined,
      name:typeof decoded.name==='string'?decoded.name:undefined,
      picture:typeof decoded.picture==='string'?decoded.picture:undefined
    };
  }catch{
    return verifyWithIdentityToolkit(idToken);
  }
}
