"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, FileSearch, Gauge, Send, Users } from 'lucide-react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { getFirebaseClient } from '@/lib/firebase/client';
import { ensureClientWorkspace } from '@/lib/auth/client-workspace';

type AuditRow = {
  id:string;
  url?:string;
  status?:string;
  overallScore?:number;
  reportSentCount?:number;
  createdAt?:any;
};

export default function Dashboard(){
  const [loading,setLoading]=useState(true);
  const [workspaceName,setWorkspaceName]=useState('My Agency');
  const [audits,setAudits]=useState<AuditRow[]>([]);
  const [clients,setClients]=useState(0);
  const [warning,setWarning]=useState('');

  useEffect(()=>{
    const {auth,db}=getFirebaseClient();

    const unsubscribe=onAuthStateChanged(auth,async user=>{
      if(!user) return;

      try{
        const workspaceId=await ensureClientWorkspace(user);
        setWorkspaceName(user.displayName ? `${user.displayName}'s Agency` : 'My Agency');

        const [auditSnap,clientSnap]=await Promise.all([
          getDocs(query(collection(db,'audits'),where('workspaceId','==',workspaceId),limit(100))),
          getDocs(query(collection(db,'clients'),where('workspaceId','==',workspaceId),limit(100)))
        ]);

        const rows=auditSnap.docs.map(doc=>({id:doc.id,...doc.data()} as AuditRow));
        rows.sort((a,b)=>{
          const av=a.createdAt?.seconds ?? 0;
          const bv=b.createdAt?.seconds ?? 0;
          return bv-av;
        });

        setAudits(rows.slice(0,8));
        setClients(clientSnap.size);
      }catch(e){
        console.warn(e);
        setWarning('Firebase login active hai. Firestore workspace data abhi available nahi hai, isliye empty dashboard dikh raha hai.');
      }finally{
        setLoading(false);
      }
    });

    return unsubscribe;
  },[]);

  const stats=useMemo(()=>{
    const completed=audits.filter(a=>a.status==='COMPLETED');
    const avg=completed.length
      ? Math.round(completed.reduce((sum,a)=>sum+(a.overallScore||0),0)/completed.length)
      : 0;

    return {
      total:audits.length,
      reportsSent:completed.reduce((sum,a)=>sum+(a.reportSentCount||0),0),
      clients,
      avg
    };
  },[audits,clients]);

  const cards=[
    [FileSearch,'Total audits',stats.total],
    [Send,'Reports sent',stats.reportsSent],
    [Users,'Clients',stats.clients],
    [Gauge,'Avg score',stats.avg||'—']
  ] as const;

  return <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-zinc-600">Workspace</p>
        <h1 className="mt-1 font-heading text-3xl font-bold">{workspaceName}</h1>
      </div>
      <Button asChild variant="accent">
        <Link href="/dashboard/audit/new"><FileSearch className="h-4 w-4"/>New Audit</Link>
      </Button>
    </header>

    {warning&&<div className="mt-5 rounded-2xl border border-magenta/15 bg-magenta/[.045] px-4 py-3 text-xs leading-5 text-zinc-400">{warning}</div>}

    <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([Icon,label,value])=><div key={label} className="reference-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">{label}</span>
          <Icon className="h-4 w-4 text-rose/70"/>
        </div>
        <div className="mt-7 font-heading text-3xl font-bold">{loading?'—':String(value)}</div>
      </div>)}
    </div>

    <section className="mt-8 overflow-hidden rounded-2xl border border-white/[.06] bg-[#0d0d0d]">
      <div className="flex items-center justify-between border-b border-white/[.06] px-5 py-4">
        <h2 className="font-heading font-bold">Recent audits</h2>
        <Link href="/dashboard/audit/new" className="text-xs text-zinc-500 transition hover:text-rose">Run another →</Link>
      </div>

      {loading
        ? <div className="p-10 text-center text-sm text-zinc-600">Loading workspace...</div>
        : audits.length===0
          ? <div className="p-10 text-center text-sm text-zinc-600">No audits yet. Your first audit will appear here.</div>
          : audits.map(a=><Link
              href={a.status==='COMPLETED'?`/dashboard/report/${a.id}`:'#'}
              key={a.id}
              className="flex items-center justify-between gap-4 border-b border-white/[.05] px-5 py-4 last:border-0 hover:bg-white/[.02]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{a.url||'Website audit'}</p>
                <p className="mt-1 text-xs text-zinc-600">{a.status?.replaceAll('_',' ')||'QUEUED'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-heading text-lg font-bold">{a.overallScore??'—'}</span>
                <ArrowUpRight className="h-4 w-4 text-zinc-700"/>
              </div>
            </Link>)
      }
    </section>
  </div>;
}
