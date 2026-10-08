"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

declare global { interface Window { Razorpay?: any } }
function loadScript(){return new Promise<boolean>((resolve)=>{if(window.Razorpay)return resolve(true);const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.body.appendChild(s)})}
export function UpgradeButton({ plan }: { plan: 'PRO'|'AGENCY' }){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function go(){setBusy(true);setError('');try{const ok=await loadScript();if(!ok)throw new Error('Razorpay checkout load nahi hua.');const r=await fetch('/api/billing/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({plan})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Checkout unavailable.');const rz=new window.Razorpay({key:data.keyId,amount:data.order.amount,currency:data.order.currency,name:'Scoryn',description:`${plan} plan`,order_id:data.order.id,handler:async(response:any)=>{const verify=await fetch('/api/billing/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...response,plan})});if(!verify.ok){const body=await verify.json().catch(()=>({}));throw new Error(body.error||'Payment verification failed.')}window.location.reload()},theme:{color:'#C51D6F'}});rz.open()}catch(e){setError(e instanceof Error?e.message:'Checkout failed.')}finally{setBusy(false)}}
  return <div><Button onClick={go} disabled={busy} variant="accent">{busy&&<LoaderCircle className="h-4 w-4 animate-spin"/>}Upgrade to {plan==='PRO'?'Pro':'Agency'}</Button>{error&&<p className="mt-2 max-w-xs text-xs text-rose-300">{error}</p>}</div>
}
