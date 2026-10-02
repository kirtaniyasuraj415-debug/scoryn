"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  FileSearch,
  Files,
  Gauge,
  MessageSquareText,
  Plus,
  Share2,
  Sparkles,
  Users
} from 'lucide-react';

type ChatSession={id:string;title:string;updatedAt:number};

export function OverviewDashboard(){
  const [clients,setClients]=useState(0);
  const [chats,setChats]=useState<ChatSession[]>([]);

  useEffect(()=>{
    try{
      const c=JSON.parse(localStorage.getItem('scoryn_clients')||'[]');
      setClients(Array.isArray(c)?c.length:0);
      const s=JSON.parse(localStorage.getItem('scoryn_chat_sessions')||'[]');
      setChats(Array.isArray(s)?s:[]);
    }catch{}
  },[]);

  const recent=useMemo(()=>[...chats].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).slice(0,5),[chats]);

  const stats=[
    [FileSearch,'Total audits','0','No audits yet'],
    [Files,'Reports','0','Ready after first audit'],
    [Users,'Clients',String(clients),'Saved workspace'],
    [MessageSquareText,'AI chats',String(chats.length),'Recent conversations']
  ] as const;

  const heat=Array.from({length:42},(_,i)=>i);
  const linePoints='0,78 42,78 84,78 126,78 168,78 210,78 252,78 294,78 336,78';

  return <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-[1380px] px-4 py-5 sm:px-5 lg:py-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[.22em] text-rose/70">Overview</p>
        <h1 className="mt-2 font-heading text-2xl text-zinc-100 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-xs leading-6 text-zinc-600">Your Scoryn workspace at a glance.</p>
      </div>
      <div className="flex gap-2">
        <Link href="/dashboard/ai" className="inline-flex h-10 items-center gap-2 rounded-full border border-magenta/15 bg-magenta/[.045] px-4 text-xs text-rose transition hover:bg-magenta/[.08]">
          <Sparkles className="h-4 w-4"/>AI Workspace
        </Link>
        <Link href="/dashboard/audit/new" className="glow-action inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs">
          <Plus className="h-4 w-4"/>New Audit
        </Link>
      </div>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(([Icon,label,value,copy])=><article key={label} className="dashboard-panel rounded-[20px] p-4">
        <div className="flex items-start justify-between">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-magenta/12 bg-magenta/[.045] text-rose"><Icon className="h-4 w-4"/></div>
          <span className="font-heading text-2xl text-zinc-100">{value}</span>
        </div>
        <h2 className="mt-6 text-xs font-medium text-zinc-300">{label}</h2>
        <p className="mt-1 text-[10px] text-zinc-650">{copy}</p>
      </article>)}
    </div>

    <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_310px]">
      <div className="grid min-w-0 gap-3">
        <div className="grid gap-3 lg:grid-cols-[.85fr_1.15fr]">
          <article className="dashboard-panel rounded-[22px] p-5">
            <div className="flex items-center justify-between">
              <div><h2 className="font-heading text-sm text-zinc-200">Audit activity</h2><p className="mt-1 text-[10px] text-zinc-650">Last 6 weeks</p></div>
              <BarChart3 className="h-4 w-4 text-rose"/>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-2">
              {heat.map(i=><span key={i} className="aspect-square rounded-[5px] border border-white/[.035] bg-white/[.02]"/> )}
            </div>
            <div className="mt-4 text-[10px] text-zinc-700">No audit activity yet.</div>
          </article>

          <article className="dashboard-panel rounded-[22px] p-5">
            <div className="flex items-center justify-between">
              <div><h2 className="font-heading text-sm text-zinc-200">Average score trend</h2><p className="mt-1 text-[10px] text-zinc-650">Performance across completed audits</p></div>
              <Gauge className="h-4 w-4 text-rose"/>
            </div>
            <div className="relative mt-6 h-44 overflow-hidden rounded-2xl border border-white/[.04] bg-black/25">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:42px_42px]"/>
              <svg viewBox="0 0 336 100" className="absolute inset-x-5 bottom-5 h-[120px] w-[calc(100%-2.5rem)]" preserveAspectRatio="none">
                <polyline points={linePoints} fill="none" stroke="rgba(197,29,111,.35)" strokeWidth="2"/>
              </svg>
              <div className="absolute inset-0 grid place-items-center"><span className="rounded-full border border-white/[.05] bg-black/70 px-3 py-1.5 text-[10px] text-zinc-650">Run an audit to populate this chart</span></div>
            </div>
          </article>
        </div>

        <article className="dashboard-panel rounded-[22px] p-5">
          <div className="flex items-center justify-between">
            <div><h2 className="font-heading text-sm text-zinc-200">Recent workspace activity</h2><p className="mt-1 text-[10px] text-zinc-650">Chats, audits and reports</p></div>
            <Link href="/dashboard/ai" className="text-[10px] text-rose">Open AI Workspace →</Link>
          </div>

          <div className="mt-5 divide-y divide-white/[.045]">
            {recent.length?recent.map((chat,index)=><Link key={chat.id} href={`/dashboard/ai?chat=${encodeURIComponent(chat.id)}`} className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-magenta/10 bg-magenta/[.035] text-rose"><MessageSquareText className="h-4 w-4"/></span>
                <div className="min-w-0"><div className="truncate text-xs text-zinc-300">{chat.title}</div><div className="mt-1 text-[9px] text-zinc-700">AI conversation</div></div>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-750"/>
            </Link>):<div className="grid min-h-40 place-items-center text-center">
              <div><MessageSquareText className="mx-auto h-5 w-5 text-zinc-800"/><p className="mt-3 text-xs text-zinc-650">No recent activity yet.</p></div>
            </div>}
          </div>
        </article>
      </div>

      <aside className="space-y-3">
        <article className="dashboard-panel rounded-[22px] p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-heading text-sm text-zinc-200">Free plan usage</h2><p className="mt-1 text-[10px] text-zinc-650">Current month</p></div><Gauge className="h-4 w-4 text-rose"/></div>
          <div className="mt-6 grid place-items-center">
            <div className="relative grid h-36 w-36 place-items-center rounded-full border-[10px] border-white/[.045]">
              <div className="absolute inset-[-10px] rotate-[-28deg] rounded-full border-[10px] border-transparent border-t-magenta border-r-rose/55"/>
              <div className="text-center"><div className="font-heading text-3xl text-zinc-100">0%</div><div className="mt-1 text-[9px] text-zinc-700">0 of 3 audits</div></div>
            </div>
          </div>
          <Link href="/dashboard/billing" className="mt-6 flex h-9 items-center justify-center rounded-full border border-magenta/15 bg-magenta/[.04] text-xs text-rose">Manage plan</Link>
        </article>

        <article className="dashboard-panel rounded-[22px] p-5">
          <div className="flex items-center justify-between"><h2 className="font-heading text-sm text-zinc-200">Quick actions</h2><Share2 className="h-4 w-4 text-rose"/></div>
          <div className="mt-4 space-y-2">
            {[
              ['/dashboard/audit/new',FileSearch,'Run website audit'],
              ['/dashboard/clients',Users,'Add or manage clients'],
              ['/dashboard/reports',Files,'Open report library']
            ].map(([href,Icon,label]:any)=><Link key={href} href={href} className="flex items-center justify-between rounded-xl border border-white/[.045] bg-black/25 px-3 py-3 text-[11px] text-zinc-500 transition hover:border-magenta/15 hover:text-zinc-300">
              <span className="flex items-center gap-2.5"><Icon className="h-4 w-4 text-rose/80"/>{label}</span><ArrowUpRight className="h-3.5 w-3.5 text-zinc-750"/>
            </Link>)}
          </div>
        </article>
      </aside>
    </div>
  </div>;
}
