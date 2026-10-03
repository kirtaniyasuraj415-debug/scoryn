"use client";

import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';

export function DownloadDemoPdfButton({reportId,mode='business'}:{reportId:string;mode?:'business'|'developer'}){
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  async function download(){
    setBusy(true);
    setError('');
    try{
      const res=await fetch('/api/demo/pdf',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({id:reportId,mode})
      });
      if(!res.ok){
        const data=await res.json().catch(()=>({}));
        throw new Error(data.error||'PDF download failed.');
      }

      const blob=await res.blob();
      const href=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=href;
      a.download=`scoryn-demo-${mode}.pdf`;
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
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-magenta/25 bg-magenta/[.06] px-4 text-sm text-rose transition hover:bg-magenta/[.10] disabled:opacity-60"
    >
      {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Download className="h-4 w-4"/>}
      {busy?'Preparing PDF…':mode==='developer'?'Developer PDF':'Business Owner PDF'}
    </button>
    {error&&<p role="alert" className="mt-2 text-xs text-rose-300">{error}</p>}
  </div>;
}
