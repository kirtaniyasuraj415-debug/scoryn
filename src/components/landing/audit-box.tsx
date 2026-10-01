"use client";
import { useState } from 'react';
import { ArrowUpRight, Globe2, LoaderCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AuditBox() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function run() {
    setError('');
    if (!url.trim()) return setError('Website URL enter karo.');
    setBusy(true);
    try {
      const res = await fetch('/api/audit/demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit start nahi hua.');
      router.push(`/demo/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  return <div className="audit-shell mx-auto w-full max-w-3xl rounded-[24px] p-[1px] shadow-[0_25px_90px_rgba(197,29,111,.18)]">
    <div className="relative overflow-hidden rounded-[23px] bg-[#0b0a0b] p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-magenta/15 blur-3xl" />
      <textarea value={url} onChange={(e)=>setUrl(e.target.value)} rows={2} placeholder="Paste client website URL..." className="relative z-10 w-full resize-none bg-transparent px-2 pt-2 text-base text-white outline-none placeholder:text-zinc-600 sm:text-lg" />
      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500"><Globe2 className="h-4 w-4" /> Mobile + desktop audit <span className="hidden sm:inline">•</span><Sparkles className="hidden h-4 w-4 sm:block" /><span className="hidden sm:inline">AI explanation</span></div>
        <button onClick={run} disabled={busy} className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:opacity-60">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
          Audit website
        </button>
      </div>
      {error && <p className="relative z-10 mt-3 text-left text-xs text-rose-300">{error}</p>}
    </div>
  </div>;
}
