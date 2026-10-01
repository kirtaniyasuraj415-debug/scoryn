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
      const res = await fetch('/api/audit/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit start nahi hua.');
      router.push(`/demo/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setBusy(false);
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
            className="h-12 w-full bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-zinc-650 sm:h-14 sm:text-base"
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
      {error && <p className="relative z-10 mt-2 px-3 text-left text-xs text-rose-300">{error}</p>}
    </div>
  </div>;
}
