"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, FileSearch, Globe2, LoaderCircle, Sparkles } from 'lucide-react';

export default function NewAudit(){
  const [url,setUrl]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const router=useRouter();

  async function submit(e:FormEvent){
    e.preventDefault();
    setError('');
    setBusy(true);
    try{
      const res=await fetch('/api/audit/demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||'Audit could not start.');
      router.push(`/demo/${data.id}`);
    }catch(e){
      setError(e instanceof Error?e.message:'Audit failed.');
      setBusy(false);
    }
  }

  return <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8 lg:py-16">
    <p className="text-[10px] uppercase tracking-[.24em] text-rose/70">New Audit</p>
    <h1 className="mt-3 font-heading text-3xl font-bold tracking-[-.04em] sm:text-5xl">Paste the URL. Scoryn handles the rest.</h1>
    <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">URL detect hote hi audit flow start hota hai. Current preview uses the demo/available PageSpeed pipeline and opens a client-ready result.</p>

    <form onSubmit={submit} className="assistant-prompt-shell mt-10 rounded-[22px] p-px">
      <div className="relative overflow-hidden rounded-[21px] bg-[#0d0d0f] p-4">
        <div className="assistant-prompt-glow pointer-events-none absolute inset-0"/>
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://clientwebsite.com" className="h-12 w-full bg-transparent px-2 text-base outline-none placeholder:text-zinc-700"/>
            <div className="flex items-center gap-2 px-2 text-[10px] text-zinc-700"><Globe2 className="h-3.5 w-3.5"/>Mobile + desktop <span>•</span><Sparkles className="h-3.5 w-3.5"/>AI-ready report</div>
          </div>
          <button disabled={!url.trim()||busy} className="glow-action inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-40">
            {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<FileSearch className="h-4 w-4"/>}
            Run audit
            {!busy&&<ArrowUpRight className="h-4 w-4"/>}
          </button>
        </div>
      </div>
    </form>
    {error&&<p className="mt-4 text-sm text-rose-300">{error}</p>}
  </div>;
}
