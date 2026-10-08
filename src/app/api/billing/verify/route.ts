import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { z } from 'zod';
import { requireServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

const schema=z.object({razorpay_order_id:z.string().min(1).max(100),razorpay_payment_id:z.string().min(1).max(100),razorpay_signature:z.string().min(1).max(200),plan:z.enum(['PRO','AGENCY'])});

export async function POST(req:Request){
  try{
    const user=await requireServerUser();
    const input=schema.parse(await req.json());
    const secret=process.env.RAZORPAY_KEY_SECRET;
    if(!secret) return NextResponse.json({error:'Payments are not active during the Scoryn beta yet.'},{status:503});
    const expected=crypto.createHmac('sha256',secret).update(input.razorpay_order_id+'|'+input.razorpay_payment_id).digest('hex');
    const a=Buffer.from(input.razorpay_signature,'utf8'),b=Buffer.from(expected,'utf8');
    if(a.length!==b.length||!crypto.timingSafeEqual(a,b)) return NextResponse.json({error:'Payment verification failed.'},{status:401});
    const workspaceId=await getDefaultWorkspaceId(user.uid);
    const {db}=getFirebaseAdmin();
    await db.collection('workspaces').doc(workspaceId).set({plan:input.plan,planStatus:'ACTIVE',paymentProvider:'razorpay',lastPaymentId:input.razorpay_payment_id,lastPaymentAt:new Date(),updatedAt:new Date()},{merge:true});
    return NextResponse.json({ok:true,plan:input.plan});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Payment verification failed.'},{status:400});}
}
