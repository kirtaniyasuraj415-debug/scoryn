"use client";

import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { getFirebaseClient } from '@/lib/firebase/client';

export function DownloadPdfButton({reportId}:{reportId:string}){
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  async function download(){
    setBusy(true);
    setError('');

    try{
      const {auth}=getFirebaseClient();
      const user=auth.currentUser;

      if(!user) throw new Error('Your login session is not available. Please refresh once.');

      const idToken=await user.getIdToken();
      const sessionRes=await fetch('/api/auth/session',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({idToken})
      });

      if(!sessionRes.ok) throw new Error('Secure session could not be refreshed.');

      const res=await fetch(`/api/report/${reportId}/pdf`,{cache:'no-store'});
      if(!res.ok){
        const data=await res.json().catch(()=>({}));
        throw new Error(data.error||'PDF download failed.');
      }

      const blob=await res.blob();
      const href=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=href;
      a.download=`scoryn-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(href),1000);
    }catch(e){
      setError(e instanceof Error?e.message:'PDF download failed.');
    }finally{
      setBusy(false);
    }
  }

  return <div>
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/[.08] bg-white/[.025] px-4 text-sm text-zinc-300 transition hover:border-magenta/20 hover:bg-magenta/[.045] hover:text-white disabled:opacity-60"
    >
      {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Download className="h-4 w-4"/>}
      {busy?'Preparing PDF…':'Download PDF'}
    </button>
    {error&&<p className="mt-2 max-w-[260px] text-xs text-rose-300">{error}</p>}
  </div>;
}
