import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export async function POST(req:Request){
  const secret=process.env.RAZORPAY_WEBHOOK_SECRET;
  if(!secret) return NextResponse.json({error:'Webhook is not configured.'},{status:503});
  const raw=await req.text();
  const sig=req.headers.get('x-razorpay-signature')||'';
  const expected=crypto.createHmac('sha256',secret).update(raw).digest('hex');
  const a=Buffer.from(sig,'utf8'),b=Buffer.from(expected,'utf8');
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b)) return NextResponse.json({error:'Invalid signature'},{status:401});
  try{
    const event=JSON.parse(raw);
    const payment=event?.payload?.payment?.entity;
    const notes=payment?.notes||{};
    const workspaceId=typeof notes.workspaceId==='string'?notes.workspaceId:null;
    const plan=notes.plan==='PRO'||notes.plan==='AGENCY'?notes.plan:null;
    if(event?.event==='payment.captured'&&workspaceId&&plan){
      const {db}=getFirebaseAdmin();
      await db.collection('workspaces').doc(workspaceId).set({plan,planStatus:'ACTIVE',paymentProvider:'razorpay',lastPaymentId:typeof payment.id==='string'?payment.id:null,lastPaymentAt:new Date(),updatedAt:new Date()},{merge:true});
    }
    return NextResponse.json({ok:true,event:event?.event||null});
  }catch{
    return NextResponse.json({error:'Invalid webhook payload.'},{status:400});
  }
}
