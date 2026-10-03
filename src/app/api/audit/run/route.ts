import { isFirebaseAdminConfigured } from '@/lib/firebase/admin';

export const maxDuration=120;

export async function POST(req:Request){
  const body=await req.text();
  const target=new URL('/api/audit/demo',req.url);
  const headers:Record<string,string>={'content-type':'application/json'};

  // Persist to the signed-in workspace only when the Admin SDK is actually
  // configured. Otherwise run the same audit as a guest instead of failing
  // the whole audit with "Firebase Admin configuration is missing".
  if(isFirebaseAdminConfigured()){
    const cookie=req.headers.get('cookie');
    if(cookie) headers.cookie=cookie;
  }

  try{
    const upstream=await fetch(target,{
      method:'POST',
      headers,
      body,
      cache:'no-store'
    });
    const text=await upstream.text();
    return new Response(text,{
      status:upstream.status,
      headers:{'content-type':upstream.headers.get('content-type')||'application/json'}
    });
  }catch(e){
    console.error('[Scoryn Audit Run]',e);
    return Response.json({error:'Audit service temporarily unavailable. Please retry.'},{status:502});
  }
}
