"use client";
import { useEffect, useState } from 'react';
import { ArrowUpRight, Globe2, LoaderCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFirebaseClient } from '@/lib/firebase/client';

export function AuditBox() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('Discovering pages…');
  const stages=['Discovering pages…','Testing website speed…','Checking accessibility…','Checking SEO…','Creating both reports…'];
  const router = useRouter();

  useEffect(()=>{
    if(!busy) return;
    let index=0;
    const timer=window.setInterval(()=>{index=Math.min(index+1,stages.length-1);setStage(stages[index]);},7000);
    return ()=>window.clearInterval(timer);
  },[busy]);

  async function run() {
    setError('');
    if (!url.trim()) return setError('Website URL enter karo.');
    setBusy(true);
    setStage(stages[0]);
    let language='ENGLISH';
    try{
      const raw=localStorage.getItem('scoryn_preferences');
      if(raw) language=JSON.parse(raw)?.language||'ENGLISH';
    }catch{}

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 105000);
    try {
      const {auth}=getFirebaseClient();
      if(auth.currentUser){
        const idToken=await auth.currentUser.getIdToken();
        await fetch('/api/auth/session',{
          method:'POST',
          headers:{'content-type':'application/json'},
          body:JSON.stringify({idToken})
        });
      }

      const res = await fetch('/api/audit/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url, language }),
        signal: controller.signal
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit start nahi hua.');
      if(data.reportId) router.push(`/dashboard/report/${data.reportId}`);
      else router.push(`/demo/${data.id}`);
    } catch (e) {
      const message = e instanceof Error
        ? (e.name === 'AbortError' ? 'Audit took too long. Please retry once.' : e.message)
        : 'Something went wrong.';
      setError(message);
      setBusy(false);
    } finally {
      clearTimeout(timeout);
    }
  }

  return <div className="audit-shell mx-auto w-full max-w-[760px] rounded-[22px] p-px">
    <div className="relative overflow-hidden rounded-[21px] bg-[#090909]/95 p-3.5 sm:p-3">
      <div className="audit-box-glow pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
            placeholder="Paste client website URL..."
            className="h-12 w-full bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-zinc-600 sm:h-14 sm:text-base"
          />
          <div className="hidden items-center gap-2 px-3 pb-1 text-[10px] text-zinc-600 sm:flex">
            <Globe2 className="h-3.5 w-3.5" />
            Mobile + desktop
            <span className="text-zinc-800">•</span>
            <Sparkles className="h-3.5 w-3.5" />
            AI explanation
          </div>
        </div>

        <button
          onClick={run}
          disabled={busy}
          className="glow-action group relative inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 disabled:opacity-60 sm:h-12 sm:w-auto"
        >
          <span className="button-sheen absolute inset-y-0 -left-12 w-10 -skew-x-12 bg-white/25 blur-sm" />
          {busy ? <LoaderCircle className="relative h-4 w-4 animate-spin" /> : <ArrowUpRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
          <span className="relative">Audit website</span>
        </button>
      </div>

      <div className="relative z-10 mt-1 flex items-center gap-2 px-3 pb-1 text-[10px] text-zinc-600 sm:hidden">
        <Globe2 className="h-3.5 w-3.5" />
        Mobile + desktop audit
        <span className="text-zinc-800">•</span>
        AI
      </div>
      {busy && <p className="relative z-10 mt-2 px-3 text-left text-[10px] text-zinc-600">{stage} One scan se Business Owner aur Developer dono reports banengi.</p>}
      {error && <p className="relative z-10 mt-2 px-3 text-left text-xs text-rose-300">{error}</p>}
    </div>
  </div>;
}
