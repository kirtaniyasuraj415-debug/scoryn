import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { requireServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';

const schema=z.object({plan:z.enum(['PRO','AGENCY'])});
const PLAN_AMOUNT={PRO:49900,AGENCY:99900} as const;

export async function POST(req:Request){
  try{
    const user=await requireServerUser();
    const {plan}=schema.parse(await req.json());
    if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({error:'Payments are not active during the Scoryn beta yet.'},{status:503});
    const workspaceId=await getDefaultWorkspaceId(user.uid);
    const rz=new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});
    const order=await rz.orders.create({amount:PLAN_AMOUNT[plan],currency:'INR',receipt:'scoryn_'+user.uid.slice(0,12)+'_'+Date.now(),notes:{userId:user.uid,workspaceId,plan}});
    return NextResponse.json({order,keyId:process.env.RAZORPAY_KEY_ID,plan});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Checkout failed'},{status:400});}
}
