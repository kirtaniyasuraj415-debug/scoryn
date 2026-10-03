"use client";

import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { getFirebaseClient } from '@/lib/firebase/client';

export function DownloadPdfButton({reportId}:{reportId:string}){
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  async function fetchPdf(){
    return fetch(`/api/report/${reportId}/pdf`,{
      cache:'no-store',
      credentials:'same-origin'
    });
  }

  async function refreshServerSession(){
    const {auth}=getFirebaseClient();
    const user=auth.currentUser;
    if(!user) return false;

    const idToken=await user.getIdToken(true);
    const sessionRes=await fetch('/api/auth/session',{
      method:'POST',
      headers:{'content-type':'application/json'},
      credentials:'same-origin',
      body:JSON.stringify({idToken})
    });

    return sessionRes.ok;
  }

  async function download(){
    setBusy(true);
    setError('');

    try{
      // First use the existing secure server session. A signed-in user should not be
      // forced through authentication again just to download a report.
      let res=await fetchPdf();

      // If the server cookie expired but Firebase is still signed in, silently refresh
      // the server session once and retry the PDF request.
      if(res.status===401){
        const refreshed=await refreshServerSession();
        if(refreshed) res=await fetchPdf();
      }

      if(!res.ok){
        const data=await res.json().catch(()=>({}));
        throw new Error(
          data.error||
          (res.status===401
            ? 'Your secure session expired. Refresh the page once and try again.'
            : 'PDF download failed.')
        );
      }

      const blob=await res.blob();
      const href=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=href;
      a.download=`scoryn-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(href),1500);
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
    {error&&<p className="mt-2 max-w-[300px] text-xs text-rose-300">{error}</p>}
  </div>;
}
