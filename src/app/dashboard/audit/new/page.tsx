"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, FileSearch, Globe2, LoaderCircle, Sparkles } from 'lucide-react';
import { ScorynMark } from '@/components/brand/scoryn-mark';
import { getFirebaseClient } from '@/lib/firebase/client';

export default function NewAudit(){
  const [url,setUrl]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [status,setStatus]=useState('');
  const [language,setLanguage]=useState('HINGLISH');
  const router=useRouter();

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('scoryn_preferences');
      if(raw){
        const p=JSON.parse(raw);
        if(p.language) setLanguage(p.language);
      }
    }catch{}
  },[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    setError('');
    setStatus('Testing mobile + desktop with Google PageSpeed…');
    setBusy(true);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),105000);
    try{
      const {auth}=getFirebaseClient();
      const current=auth.currentUser;
      if(current){
        const idToken=await current.getIdToken();
        await fetch('/api/auth/session',{
          method:'POST',
          headers:{'content-type':'application/json'},
          body:JSON.stringify({idToken})
        });
      }

      const res=await fetch('/api/audit/demo',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({url,language}),
        signal:controller.signal
      });
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||'Audit could not start.');
      setStatus('Audit complete. Opening report…');
      if(data.reportId){
        router.push(`/dashboard/report/${data.reportId}`);
      }else{
        router.push(`/demo/${data.id}`);
      }
    }catch(e){
      const message=e instanceof Error
        ? (e.name==='AbortError'?'Audit took too long. Please retry once.':e.message)
        : 'Audit failed.';
      setError(message);
      setStatus('');
      setBusy(false);
    }finally{
      clearTimeout(timeout);
    }
  }

  return <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
    <div className="hero-grid pointer-events-none absolute inset-0 opacity-[.30]"/>
    <div className="hero-ambient-glow pointer-events-none absolute left-1/2 top-[48%] h-[520px] w-[880px] -translate-x-1/2 rounded-full opacity-55"/>

    <section className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl items-center px-4 py-12 sm:px-8">
      <div className="w-full">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-magenta/20 bg-[#0b090a] shadow-[0_0_34px_rgba(197,29,111,.14)]">
            <ScorynMark size={40} className="border-0 shadow-none"/>
          </div>
          <p className="text-[10px] uppercase tracking-[.24em] text-rose/70">New Audit</p>
          <h1 className="mt-3 font-heading text-balance text-3xl font-bold tracking-[-.045em] sm:text-5xl">Paste the URL. Scoryn handles the rest.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-600">Website URL paste karo. Scoryn mobile + desktop checks ko start karke client-ready result open karega.</p>
        </div>

        <form onSubmit={submit} className="audit-shell mx-auto mt-9 w-full max-w-[760px] rounded-[22px] p-px">
          <div className="relative overflow-hidden rounded-[21px] bg-[#050505] p-3.5 sm:p-4">
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <input
                  value={url}
                  onChange={e=>setUrl(e.target.value)}
                  placeholder="https://clientwebsite.com"
                  className="h-12 w-full bg-transparent px-2 text-[15px] text-white outline-none placeholder:text-zinc-700 sm:h-14 sm:text-base"
                />
                <div className="flex flex-wrap items-center gap-2 px-2 pb-1 text-[10px] text-zinc-700">
                  <Globe2 className="h-3.5 w-3.5"/>Mobile + desktop
                  <span>•</span>
                  <Sparkles className="h-3.5 w-3.5"/>AI-ready report
                </div>
                <div className="mt-2 px-2">
                  <select
                    value={language}
                    onChange={e=>setLanguage(e.target.value)}
                    className="h-9 rounded-xl border border-white/[.06] bg-[#090909] px-3 text-xs text-zinc-400 outline-none focus:border-magenta/20"
                  >
                    <option value="ENGLISH">English</option>
                    <option value="HINGLISH">Hinglish</option>
                    <option value="HINDI">हिन्दी</option>
                    <option value="BENGALI">বাংলা</option>
                    <option value="MARATHI">मराठी</option>
                    <option value="GUJARATI">ગુજરાતી</option>
                    <option value="TAMIL">தமிழ்</option>
                    <option value="TELUGU">తెలుగు</option>
                  </select>
                </div>
              </div>
              <button disabled={!url.trim()||busy} className="glow-action inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-40">
                {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<FileSearch className="h-4 w-4"/>}
                Run audit
                {!busy&&<ArrowUpRight className="h-4 w-4"/>}
              </button>
            </div>
          </div>
        </form>

        {busy&&<p className="mx-auto mt-4 max-w-[760px] text-center text-xs text-zinc-600">{status} This normally takes around 20–60 seconds.</p>}
        {error&&<p className="mx-auto mt-4 max-w-[760px] rounded-xl border border-red-400/10 bg-red-400/[.035] px-4 py-3 text-sm text-rose-300">{error}</p>}

        <div className="mx-auto mt-8 grid max-w-[760px] gap-3 md:grid-cols-3">
          {[
            ['01','Testing speed','Mobile + desktop performance signals.'],
            ['02','AI explanation','Technical issues in simple client language.'],
            ['03','Report output','Branded result ready to share.']
          ].map(([step,title,copy])=><div key={step} className="reference-card rounded-[20px] p-4">
            <div className="font-heading text-xl font-bold text-rose/80">{step}</div>
            <h3 className="mt-7 font-heading text-xs font-bold">{title}</h3>
            <p className="mt-2 text-[10px] leading-5 text-zinc-600">{copy}</p>
          </div>)}
        </div>
      </div>
    </section>
  </div>;
}
