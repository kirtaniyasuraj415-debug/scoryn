"use client";
import { FormEvent, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export function AddClientButton(){
  const [open,setOpen]=useState(false), [busy,setBusy]=useState(false), [error,setError]=useState('');
  const [name,setName]=useState(''), [website,setWebsite]=useState(''), [contact,setContact]=useState(''), [whatsapp,setWhatsapp]=useState(''); const router=useRouter();
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');const r=await fetch('/api/clients',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,website,contact,whatsapp})});const data=await r.json();if(!r.ok){setError(data.error||'Failed');setBusy(false);return}setOpen(false);setName('');setWebsite('');router.refresh();setBusy(false)}
  return <><Button variant="outline" onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/>Add client</Button>{open&&<div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl">Add client</h2><button type="button" onClick={()=>setOpen(false)} className="text-zinc-600 hover:text-white"><X className="h-5 w-5"/></button></div><div className="mt-6 space-y-3"><Input placeholder="Client name" value={name} onChange={e=>setName(e.target.value)} required/><Input placeholder="https://clientwebsite.com" value={website} onChange={e=>setWebsite(e.target.value)} required/><Input placeholder="Contact person (optional)" value={contact} onChange={e=>setContact(e.target.value)}/><Input placeholder="WhatsApp number (optional)" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)}/></div>{error&&<p className="mt-3 text-xs text-rose-300">{error}</p>}<Button disabled={busy} variant="accent" className="mt-6 w-full">Create client</Button></form></div>}</>;
}

export function WhatsAppReportButton({ phone, shareUrl }: { phone?: string | null; shareUrl?: string | null }) {
  function send(){if(!shareUrl)return;const text=`Website audit report: ${shareUrl}`;const normalized=(phone||'').replace(/\D/g,'');const link=`https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;window.open(link,'_blank','noopener,noreferrer')}
  return <Button size="sm" variant="outline" disabled={!shareUrl} onClick={send}>Send report</Button>;
}
