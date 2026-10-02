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

  return <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-5xl px-4 py-10 pb-20 sm:px-8 lg:py-14">
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

    <div className="mt-10 grid gap-3 md:grid-cols-3">
      {[
        ['01','Testing speed','Scoryn reads the website and prepares mobile + desktop performance data.'],
        ['02','AI explanation','Technical issues are converted into simple client-facing language.'],
        ['03','Report output','The result becomes a branded report that can be shared with the client.']
      ].map(([step,title,copy])=><div key={step} className="reference-card rounded-[22px] p-5">
        <div className="font-heading text-2xl font-bold text-rose/80">{step}</div>
        <h3 className="mt-8 font-heading text-sm font-bold">{title}</h3>
        <p className="mt-2 text-xs leading-6 text-zinc-600">{copy}</p>
      </div>)}
    </div>
  </div>;
}
