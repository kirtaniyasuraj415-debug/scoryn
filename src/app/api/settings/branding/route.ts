import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { REPORT_LANGUAGES } from '@/lib/audit/explain';

const schema=z.object({
  agencyName:z.string().max(120),
  primaryColor:z.string().regex(/^#[0-9a-fA-F]{6}$/),
  whatsapp:z.string().max(40),
  email:z.string().max(160),
  phone:z.string().max(40),
  signature:z.string().max(500),
  reportLanguage:z.enum(REPORT_LANGUAGES)
});

export async function GET(){
  try{
    const u=await requireServerUser();
    const w=await getDefaultWorkspaceId(u.uid);
    const {db}=getFirebaseAdmin();
    const snap=await db.collection('branding').doc(w).get();
    const data=snap.data()||{};
    return NextResponse.json({
      agencyName:data.agencyName||'',
      primaryColor:data.primaryColor||'#C51D6F',
      whatsapp:data.whatsapp||'',
      email:data.email||'',
      phone:data.phone||'',
      signature:data.signature||'',
      reportLanguage:data.reportLanguage||'HINGLISH'
    });
  }catch(e){
    const message=e instanceof Error?e.message:'Load failed';
    return NextResponse.json({error:message},{status:message==='UNAUTHENTICATED'?401:400});
  }
}

export async function PUT(req:Request){
  try{
    const u=await requireServerUser();
    const v=schema.parse(await req.json());
    const w=await getDefaultWorkspaceId(u.uid);
    const {db}=getFirebaseAdmin();
    await db.collection('branding').doc(w).set({
      ...v,
      workspaceId:w,
      updatedAt:new Date()
    },{merge:true});
    return NextResponse.json({ok:true});
  }catch(e){
    const message=e instanceof Error?e.message:'Save failed';
    return NextResponse.json({error:message},{status:message==='UNAUTHENTICATED'?401:400});
  }
}
