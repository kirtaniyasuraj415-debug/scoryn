"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, signOut, updateProfile, type User } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  ChevronDown,
  CreditCard,
  FileSearch,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Search,
  Settings,
  UserRound,
  Users,
  X
} from 'lucide-react';
import { getFirebaseClient } from '@/lib/firebase/client';
import { ensureClientWorkspace } from '@/lib/auth/client-workspace';
import { ScorynMark } from '@/components/brand/scoryn-mark';
import { cn } from '@/lib/utils';

const nav=[
  ['/dashboard',BarChart3,'AI Workspace'],
  ['/dashboard/audit/new',FileSearch,'New Audit'],
  ['/dashboard/clients',Users,'Clients'],
  ['/dashboard/settings',Palette,'Branding'],
  ['/dashboard/billing',CreditCard,'Billing']
] as const;

function Avatar({user,size=34}:{user:User;size?:number}){
  const initials=(user.displayName||user.email||'S').trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();
  if(user.photoURL) return <img src={user.photoURL} alt="" className="rounded-full object-cover ring-1 ring-white/10" style={{width:size,height:size}}/>;
  return <span className="grid rounded-full border border-magenta/25 bg-gradient-to-br from-[#5f1037] to-[#c51d6f] text-xs font-bold text-white shadow-[0_0_24px_rgba(197,29,111,.16)]" style={{width:size,height:size,placeItems:'center'}}>{initials}</span>;
}

export function DashboardShell({children}:{children:React.ReactNode}) {
  const router=useRouter();
  const pathname=usePathname();
  const [user,setUser]=useState<User|null>(null);
  const [ready,setReady]=useState(false);
  const [collapsed,setCollapsed]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [editOpen,setEditOpen]=useState(false);
  const [name,setName]=useState('');
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    try{setCollapsed(localStorage.getItem('scoryn_sidebar_collapsed')==='1');}catch{}
    const {auth}=getFirebaseClient();
    const unsubscribe=onAuthStateChanged(auth,current=>{
      if(!current){
        setReady(true);
        router.replace('/login');
        return;
      }

      setUser(current);
      setName(current.displayName||'');
      setReady(true);

      // Non-blocking: never hold the UI while Firestore initializes.
      void ensureClientWorkspace(current).catch(()=>{});
    });
    return unsubscribe;
  },[router]);

  useEffect(()=>setMobileOpen(false),[pathname]);

  const pageTitle=useMemo(()=>{
    const item=nav.find(([href])=>href===pathname);
    if(item) return item[2];
    if(pathname.includes('/report/')) return 'Audit Report';
    return 'Scoryn';
  },[pathname]);

  function toggleCollapsed(){
    setCollapsed(v=>{
      const next=!v;
      try{localStorage.setItem('scoryn_sidebar_collapsed',next?'1':'0');}catch{}
      return next;
    });
  }

  async function logout(){
    const {auth}=getFirebaseClient();
    await signOut(auth);
    router.replace('/');
  }

  async function saveProfile(){
    if(!user) return;
    setSaving(true);
    try{
      await updateProfile(user,{displayName:name.trim()||null});
      setUser({...user,displayName:name.trim()||null} as User);
      setEditOpen(false);
    }finally{
      setSaving(false);
    }
  }

  if(!ready){
    return <div className="grid min-h-screen place-items-center bg-[#070707] text-white">
      <div className="flex items-center gap-3 text-sm text-zinc-600">
        <span className="h-2 w-2 animate-pulse rounded-full bg-magenta shadow-[0_0_18px_rgba(197,29,111,.7)]"/>
        Opening Scoryn…
      </div>
    </div>;
  }

  if(!user) return null;

  const sidebar=<aside className={cn(
    'flex h-full flex-col border-r border-white/[.055] bg-[#09090a] transition-[width] duration-300',
    collapsed?'w-[76px]':'w-[244px]'
  )}>
    <div className="flex h-16 items-center gap-3 border-b border-white/[.05] px-4">
      <ScorynMark size={34}/>
      {!collapsed&&<div className="min-w-0"><div className="font-heading text-sm font-bold">Scoryn</div><div className="text-[9px] text-zinc-700">AI Website Audit</div></div>}
      <button onClick={toggleCollapsed} className="ml-auto hidden h-8 w-8 place-items-center rounded-lg text-zinc-700 transition hover:bg-magenta/[.05] hover:text-rose lg:grid">
        {collapsed?<PanelLeftOpen className="h-4 w-4"/>:<PanelLeftClose className="h-4 w-4"/>}
      </button>
    </div>

    <nav className="space-y-1 px-3 py-4">
      {nav.map(([href,Icon,label])=>{
        const active=pathname===href;
        return <Link key={href} href={href} className={cn(
          'group flex h-11 items-center rounded-xl text-sm transition',
          collapsed?'justify-center px-0':'gap-3 px-3',
          active?'border border-magenta/15 bg-magenta/[.065] text-rose shadow-[inset_0_1px_0_rgba(255,255,255,.025)]':'text-zinc-600 hover:bg-white/[.025] hover:text-zinc-300'
        )} title={collapsed?label:undefined}>
          <Icon className="h-4 w-4 shrink-0"/>
          {!collapsed&&<span>{label}</span>}
        </Link>;
      })}
    </nav>

    {!collapsed&&<div className="mx-3 mt-1 rounded-xl border border-white/[.045] bg-black/25 p-3">
      <div className="text-[9px] uppercase tracking-[.2em] text-zinc-750">Recent</div>
      <div className="mt-3 space-y-2 text-[11px] text-zinc-700">
        <div className="truncate">Website audit conversations</div>
        <div className="truncate">Client report drafts</div>
      </div>
    </div>}

    <div className="mt-auto border-t border-white/[.05] p-3">
      <button onClick={()=>setProfileOpen(v=>!v)} className={cn('flex w-full items-center rounded-xl transition hover:bg-white/[.025]',collapsed?'justify-center p-2':'gap-3 p-2')}>
        <Avatar user={user} size={32}/>
        {!collapsed&&<><div className="min-w-0 flex-1 text-left"><div className="truncate text-xs font-medium text-zinc-300">{user.displayName||'My profile'}</div><div className="truncate text-[9px] text-zinc-700">{user.email}</div></div><ChevronDown className="h-3.5 w-3.5 text-zinc-700"/></>}
      </button>
    </div>
  </aside>;

  return <div className="min-h-screen bg-[#070707] text-white">
    <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>

    {mobileOpen&&<div className="fixed inset-0 z-[70] lg:hidden">
      <button aria-label="Close sidebar" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>setMobileOpen(false)}/>
      <div className="absolute inset-y-0 left-0 w-[270px] shadow-2xl">{sidebar}</div>
      <button onClick={()=>setMobileOpen(false)} className="absolute left-[282px] top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-[#111] text-zinc-400"><X className="h-4 w-4"/></button>
    </div>}

    <header className={cn(
      'fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b border-white/[.05] bg-[#080809]/90 px-3 backdrop-blur-xl transition-[padding] duration-300 sm:px-5',
      collapsed?'lg:pl-[92px]':'lg:pl-[260px]'
    )}>
      <button onClick={()=>setMobileOpen(true)} className="mr-2 grid h-9 w-9 place-items-center rounded-lg text-zinc-500 hover:bg-white/[.03] lg:hidden"><Menu className="h-5 w-5"/></button>
      <div className="hidden items-center gap-2 text-xs text-zinc-700 sm:flex"><span>Home</span><span>/</span><span className="text-zinc-400">{pageTitle}</span></div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden h-9 w-[220px] items-center gap-2 rounded-xl border border-white/[.055] bg-white/[.018] px-3 text-xs text-zinc-700 md:flex">
          <Search className="h-3.5 w-3.5"/><span>Search anything…</span>
        </div>
        <div className="relative">
          <button onClick={()=>setProfileOpen(v=>!v)} className="flex h-10 items-center gap-2 rounded-full border border-white/[.055] bg-white/[.018] p-1 pr-2 transition hover:border-magenta/15">
            <Avatar user={user} size={30}/>
            <ChevronDown className="h-3 w-3 text-zinc-700"/>
          </button>

          {profileOpen&&<div className="absolute right-0 top-12 z-[90] w-[250px] overflow-hidden rounded-2xl border border-white/[.075] bg-[#111113] p-2 shadow-[0_24px_80px_rgba(0,0,0,.55)]">
            <div className="flex items-center gap-3 border-b border-white/[.05] p-3">
              <Avatar user={user} size={38}/>
              <div className="min-w-0"><div className="truncate text-sm font-medium">{user.displayName||'Scoryn user'}</div><div className="truncate text-[10px] text-zinc-650">{user.email}</div></div>
            </div>
            <button onClick={()=>{setEditOpen(true);setProfileOpen(false);}} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-zinc-400 hover:bg-magenta/[.05] hover:text-rose"><UserRound className="h-4 w-4"/>Edit profile</button>
            <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-zinc-400 hover:bg-magenta/[.05] hover:text-rose"><Settings className="h-4 w-4"/>Settings & branding</Link>
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-zinc-500 hover:bg-red-500/[.05] hover:text-red-300"><LogOut className="h-4 w-4"/>Log out</button>
          </div>}
        </div>
      </div>
    </header>

    <main className={cn(
      'min-h-screen pt-16 transition-[padding] duration-300',
      collapsed?'lg:pl-[76px]':'lg:pl-[244px]'
    )}>
      {children}
    </main>

    {editOpen&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <button className="absolute inset-0" onClick={()=>setEditOpen(false)} aria-label="Close"/>
      <div className="relative w-full max-w-md rounded-[24px] border border-white/[.075] bg-[#101012] p-6 shadow-2xl">
        <div className="flex items-center gap-3"><Avatar user={user} size={46}/><div><h2 className="font-heading text-lg font-bold">Edit profile</h2><p className="text-xs text-zinc-650">{user.email}</p></div></div>
        <label className="mt-6 block text-xs text-zinc-500">Display name<input value={name} onChange={e=>setName(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/[.07] bg-black/30 px-3 text-sm outline-none focus:border-magenta/25"/></label>
        <div className="mt-6 flex justify-end gap-2"><button onClick={()=>setEditOpen(false)} className="rounded-full px-4 py-2 text-xs text-zinc-500">Cancel</button><button disabled={saving} onClick={saveProfile} className="glow-action rounded-full px-5 py-2 text-xs font-semibold">{saving?'Saving…':'Save profile'}</button></div>
      </div>
    </div>}
  </div>;
}
