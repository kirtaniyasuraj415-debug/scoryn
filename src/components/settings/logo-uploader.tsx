"use client";
import { useState } from 'react';
import { Upload, LoaderCircle } from 'lucide-react';

export function LogoUploader({ initialUrl }: { initialUrl?: string | null }) {
  const [url, setUrl] = useState(initialUrl || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setError('');
    const fd = new FormData(); fd.set('file', file);
    const r = await fetch('/api/settings/logo', { method: 'POST', body: fd });
    const data = await r.json();
    if (!r.ok) setError(data.error || 'Upload failed.');
    else setUrl(data.logoUrl);
    setBusy(false);
  }
  return <div>
    <div className="flex min-h-24 items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
      {url ? <img src={url} alt="Agency logo" className="h-16 w-16 rounded-xl object-contain bg-white p-2" /> : <div className="grid h-16 w-16 place-items-center rounded-xl border border-white/10 text-zinc-600"><Upload className="h-5 w-5"/></div>}
      <div><label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[.05]">{busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Upload className="h-4 w-4"/>}Upload logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" disabled={busy} onChange={e=>upload(e.target.files?.[0])}/></label><p className="mt-2 text-xs text-zinc-600">PNG/JPG/WebP/SVG • max 3MB</p></div>
    </div>{error&&<p className="mt-2 text-xs text-rose-300">{error}</p>}
  </div>;
}
