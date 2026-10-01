"use client";

import { FormEvent, useEffect, useState } from 'react';
import { ExternalLink, Plus, Search, Users, X } from 'lucide-react';

type Client={id:string;name:string;website:string;contact:string;whatsapp:string};

export default function Clients(){
  const [clients,setClients]=useState<Client[]>([]);
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [form,setForm]=useState({name:'',website:'',contact:'',whatsapp:''});

  useEffect(()=>{try{const raw=localStorage.getItem('scoryn_clients');if(raw)setClients(JSON.parse(raw));}catch{}},[]);
  function save(next:Client[]){setClients(next);try{localStorage.setItem('scoryn_clients',JSON.stringify(next));}catch{}}

  function submit(e:FormEvent){
    e.preventDefault();
    const item={id:String(Date.now()),...form};
    save([item,...clients]);
    setForm({name:'',website:'',contact:'',whatsapp:''});
    setOpen(false);
  }

  const rows=clients.filter(c=>(c.name+' '+c.website+' '+c.contact).toLowerCase().includes(query.toLowerCase()));

  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-[10px] uppercase tracking-[.24em] text-rose/70">Clients</p><h1 className="mt-2 font-heading text-3xl font-bold">Client workspace</h1><p className="mt-2 text-sm text-zinc-600">Keep prospect websites and contact details ready for audits.</p></div>
      <button onClick={()=>setOpen(true)} className="glow-action inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold"><Plus className="h-4 w-4"/>Add client</button>
    </div>

    <div className="mt-7 flex h-11 max-w-md items-center gap-2 rounded-xl border border-white/[.06] bg-white/[.018] px-3"><Search className="h-4 w-4 text-zinc-700"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search clients…" className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-700"/></div>

    <div className="mt-6 overflow-hidden rounded-2xl border border-white/[.055] bg-[#0b0b0c]">
      {rows.length===0?<div className="grid min-h-52 place-items-center p-8 text-center"><div><Users className="mx-auto h-6 w-6 text-zinc-800"/><p className="mt-3 text-sm text-zinc-600">No clients yet. Add the first prospect you want to audit.</p></div></div>:rows.map(c=><div key={c.id} className="grid gap-3 border-b border-white/[.045] p-4 last:border-0 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
        <div><div className="font-heading text-sm font-bold">{c.name}</div><div className="mt-1 text-[11px] text-zinc-600">{c.contact||c.whatsapp||'No contact yet'}</div></div>
        <div className="truncate text-xs text-zinc-600">{c.website}</div>
        <a href={c.website.startsWith('http')?c.website:`https://${c.website}`} target="_blank" className="grid h-9 w-9 place-items-center rounded-full border border-white/[.06] text-zinc-600 hover:border-magenta/20 hover:text-rose"><ExternalLink className="h-4 w-4"/></a>
      </div>)}
    </div>

    {open&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <button className="absolute inset-0" onClick={()=>setOpen(false)} aria-label="Close"/>
      <form onSubmit={submit} className="relative w-full max-w-md rounded-[24px] border border-white/[.075] bg-[#101012] p-6">
        <div className="flex items-center justify-between"><h2 className="font-heading text-xl font-bold">Add client</h2><button type="button" onClick={()=>setOpen(false)} className="text-zinc-700"><X className="h-5 w-5"/></button></div>
        <div className="mt-6 space-y-3">
          {[
            ['name','Client name'],
            ['website','Website URL'],
            ['contact','Contact person'],
            ['whatsapp','WhatsApp number']
          ].map(([key,label])=><input key={key} value={(form as any)[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={label} required={key==='name'||key==='website'} className="h-11 w-full rounded-xl border border-white/[.06] bg-black/30 px-3 text-sm outline-none placeholder:text-zinc-700 focus:border-magenta/20"/>)}
        </div>
        <button className="glow-action mt-6 h-11 w-full rounded-full text-sm font-semibold">Save client</button>
      </form>
    </div>}
  </div>;
}
