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
  Files,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Plus,
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

const workspaceNav=[
  ['/dashboard',LayoutDashboard,'Dashboard'],
  ['/dashboard/ai',BarChart3,'AI Workspace'],
  ['/dashboard/audit/new',FileSearch,'New Audit'],
  ['/dashboard/reports',Files,'Reports']
] as const;

const manageNav=[
  ['/dashboard/clients',Users,'Clients'],
  ['/dashboard/settings',Palette,'Branding'],
  ['/dashboard/billing',CreditCard,'Billing']
] as const;

type RecentChat={id:string;title:string;updatedAt:number};

function Avatar({user,size=34}:{user:User;size?:number}){
  const initials=(user.displayName||user.email||'S').trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();
  if(user.photoURL) return <img src={user.photoURL} alt="" className="rounded-full object-cover ring-1 ring-white/10" style={{width:size,height:size}}/>;
  return <span className="grid rounded-full border border-magenta/25 bg-gradient-to-br from-[#5f1037] to-[#c51d6f] text-xs font-medium text-white shadow-[0_0_24px_rgba(197,29,111,.16)]" style={{width:size,height:size,placeItems:'center'}}>{initials}</span>;
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
  const [recentChats,setRecentChats]=useState<RecentChat[]>([]);

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
      void ensureClientWorkspace(current).catch(()=>{});
    });
    return unsubscribe;
  },[router]);

  useEffect(()=>{
    const load=()=>{
      try{
        const raw=localStorage.getItem('scoryn_chat_sessions');
        const sessions=raw?JSON.parse(raw):[];
        setRecentChats((Array.isArray(sessions)?sessions:[])
          .map((s:any)=>({id:String(s.id),title:String(s.title||'Untitled chat'),updatedAt:Number(s.updatedAt||0)}))
          .sort((a:RecentChat,b:RecentChat)=>b.updatedAt-a.updatedAt)
          .slice(0,4));
      }catch{setRecentChats([]);}
    };
    load();
    window.addEventListener('scoryn-chat-history-updated',load);
    return ()=>window.removeEventListener('scoryn-chat-history-updated',load);
  },[]);

  useEffect(()=>setProfileOpen(false),[pathname]);

  useEffect(()=>{
    if(!mobileOpen) return;
    const previousOverflow=document.body.style.overflow;
    const previousTouchAction=document.body.style.touchAction;
    document.body.style.overflow='hidden';
    document.body.style.touchAction='none';
    return ()=>{
      document.body.style.overflow=previousOverflow;
      document.body.style.touchAction=previousTouchAction;
    };
  },[mobileOpen]);

  const pageTitle=useMemo(()=>{
    const item=[...workspaceNav,...manageNav].find(([href])=>href===pathname);
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
      const next={...user,displayName:name.trim()||null} as User;
      setUser(next);
      window.dispatchEvent(new CustomEvent('scoryn-profile-updated',{detail:{displayName:next.displayName}}));
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
  const currentUser=user;

  function NavGroup({label,items,compact}:{label:string;items:readonly (readonly [string,any,string])[];compact:boolean}){
    return <div className="mt-4">
      {!compact&&<div className="px-3 pb-2 text-[9px] font-medium uppercase tracking-[.22em] text-zinc-800">{label}</div>}
      <div className="space-y-1">
        {items.map(([href,Icon,title])=>{
          const active=pathname===href;
          return <Link key={href} href={href} onClick={()=>{ if(window.innerWidth<768) setMobileOpen(false); }} className={cn(
            'group flex h-10 items-center rounded-xl text-[12px] transition',
            compact?'justify-center px-0':'gap-3 px-3',
            active?'border border-magenta/15 bg-magenta/[.07] text-rose':'text-zinc-600 hover:bg-white/[.025] hover:text-zinc-300'
          )} title={compact?title:undefined}>
            <Icon className="h-4 w-4 shrink-0"/>
            {!compact&&<span>{title}</span>}
          </Link>;
        })}
      </div>
    </div>;
  }

  function SidebarPanel({forceExpanded=false,mobile=false}:{forceExpanded?:boolean;mobile?:boolean}){
    const compact=forceExpanded?false:collapsed;
    return <aside className={cn(
      'flex h-full max-h-[100dvh] flex-col overflow-hidden border-r border-white/[.055] bg-[#09090a] transition-[width] duration-300',
      mobile?'w-[min(86vw,340px)]':compact?'w-[72px]':'w-[224px]'
    )}>
      <div className={cn(
        "flex items-center gap-3 border-b border-white/[.05]",
        mobile?"h-[72px] px-4":"h-16 px-3"
      )}>
        <ScorynMark size={mobile?40:34}/>
        {!compact&&<div className="min-w-0 flex-1"><div className={cn("font-heading text-zinc-100",mobile?"text-base":"text-sm")}>Scoryn</div><div className={cn("mt-0.5 text-zinc-700",mobile?"text-[10px]":"text-[9px]")}>AI Website Audit</div></div>}
        {mobile
          ? <button onClick={()=>setMobileOpen(false)} aria-label="Close navigation" className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[.06] bg-white/[.015] text-zinc-500 transition hover:border-magenta/20 hover:bg-magenta/[.04] hover:text-rose"><X className="h-4 w-4"/></button>
          : <button onClick={toggleCollapsed} className="ml-auto hidden h-8 w-8 place-items-center rounded-lg text-zinc-700 transition hover:bg-magenta/[.05] hover:text-rose md:grid">
              {compact?<PanelLeftOpen className="h-4 w-4"/>:<PanelLeftClose className="h-4 w-4"/>}
            </button>
        }
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NavGroup label="Workspace" items={workspaceNav} compact={compact}/>
        <NavGroup label="Manage" items={manageNav} compact={compact}/>

        {!compact&&<>
          <div className="mx-0.5 mt-5">
            <div className="flex items-center justify-between px-1">
              <div className="text-[9px] font-medium uppercase tracking-[.2em] text-zinc-800">Recent chats</div>
              <Link href="/dashboard/ai" onClick={()=>{ if(window.innerWidth<768) setMobileOpen(false); }} className="grid h-6 w-6 place-items-center rounded-md text-zinc-700 transition hover:bg-white/[.03] hover:text-rose"><Plus className="h-3.5 w-3.5"/></Link>
            </div>
            <div className="mt-2 space-y-1">
              {recentChats.length
                ? recentChats.map(chat=><Link key={chat.id} href={`/dashboard/ai?chat=${encodeURIComponent(chat.id)}`} onClick={()=>{ if(window.innerWidth<768) setMobileOpen(false); }} className="flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] text-zinc-600 transition hover:bg-white/[.025] hover:text-zinc-300">
                    <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-zinc-700"/><span className="truncate">{chat.title}</span>
                  </Link>)
                : <div className="px-2 py-2 text-[10px] text-zinc-800">No chats yet</div>}
            </div>
          </div>

          <div className="sidebar-usage-card mx-0.5 mt-4 rounded-2xl p-3">
            <div className="flex items-center justify-between"><span className="text-[10px] text-zinc-400">Free plan</span><span className="text-[9px] text-rose">0 / 3</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.05]"><div className="h-full w-[8%] rounded-full bg-gradient-to-r from-[#9d1457] to-[#e24c97]"/></div>
            <Link href="/dashboard/billing" onClick={()=>{ if(window.innerWidth<768) setMobileOpen(false); }} className="mt-3 block text-[10px] text-zinc-600 transition hover:text-rose">View usage & plans →</Link>
          </div>
        </>}
      </div>

      <div className="shrink-0 border-t border-white/[.05] bg-[#09090a] p-3">
        {!compact&&<Link href="/dashboard/settings" className="mb-1 flex items-center gap-3 rounded-xl px-2.5 py-2 text-[11px] text-zinc-600 transition hover:bg-white/[.025] hover:text-zinc-300"><LifeBuoy className="h-4 w-4"/>Help & settings</Link>}
        <button onClick={()=>setProfileOpen(v=>!v)} className={cn('flex w-full items-center rounded-xl transition hover:bg-white/[.025]',compact?'justify-center p-2':'gap-3 p-2')}>
          <Avatar user={currentUser} size={32}/>
          {!compact&&<><div className="min-w-0 flex-1 text-left"><div className="truncate text-xs text-zinc-300">{currentUser.displayName||'My profile'}</div><div className="truncate text-[9px] text-zinc-700">{currentUser.email}</div></div><ChevronDown className="h-3.5 w-3.5 text-zinc-700"/></>}
        </button>
      </div>
    </aside>;
  }

  return <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="hero-grid absolute inset-0 opacity-[.20]"/>
      <div className="noise absolute inset-0 opacity-[.05]"/>
      <div className="dashboard-ambient-glow absolute left-1/2 top-[58%] h-[620px] w-[980px] -translate-x-1/2 rounded-full"/>
    </div>

    <div className="fixed inset-y-0 left-0 z-40 hidden md:block"><SidebarPanel/></div>

    <div className={cn(
      'fixed inset-0 z-[70] md:hidden',
      mobileOpen?'pointer-events-auto':'pointer-events-none'
    )} aria-hidden={!mobileOpen}>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={()=>setMobileOpen(false)}
        className={cn(
          'absolute inset-0 bg-black/68 backdrop-blur-[2px] transition-opacity duration-250',
          mobileOpen?'opacity-100':'opacity-0'
        )}
      />
      <div className={cn(
        'absolute inset-y-0 left-0 shadow-[20px_0_70px_rgba(0,0,0,.55)] transition-transform duration-300',
        mobileOpen?'translate-x-0':'-translate-x-full'
      )}>
        <SidebarPanel forceExpanded mobile/>
      </div>
    </div>

    <header className={cn(
      'fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b border-white/[.05] bg-[#080809]/94 px-3 backdrop-blur-xl transition-[padding] duration-300 sm:px-5',
      collapsed?'md:pl-[88px]':'md:pl-[240px]'
    )}>
      <button onClick={()=>setMobileOpen(true)} className={cn(
        'mr-2 grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/[.03] hover:text-rose md:hidden',
        mobileOpen&&'pointer-events-none opacity-0'
      )}><Menu className="h-5 w-5"/></button>

      <div className="hidden items-center gap-2 text-xs text-zinc-700 sm:flex"><span>Home</span><span>/</span><span className="text-zinc-400">{pageTitle}</span></div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden h-9 w-[240px] items-center gap-2 rounded-xl border border-white/[.055] bg-white/[.018] px-3 text-xs text-zinc-700 lg:flex">
          <Search className="h-3.5 w-3.5"/><span>Search anything…</span>
        </div>
        <div className="relative">
          <button onClick={()=>setProfileOpen(v=>!v)} className="flex h-10 items-center gap-2 rounded-full border border-white/[.055] bg-white/[.018] p-1 pr-2 transition hover:border-magenta/15">
            <Avatar user={currentUser} size={30}/>
            <ChevronDown className="h-3 w-3 text-zinc-700"/>
          </button>

          {profileOpen&&<div className="absolute right-0 top-12 z-[90] w-[250px] overflow-hidden rounded-2xl border border-white/[.075] bg-[#111113] p-2 shadow-[0_24px_80px_rgba(0,0,0,.55)]">
            <div className="flex items-center gap-3 border-b border-white/[.05] p-3">
              <Avatar user={currentUser} size={38}/>
              <div className="min-w-0"><div className="truncate text-sm text-zinc-200">{currentUser.displayName||'Scoryn user'}</div><div className="truncate text-[10px] text-zinc-600">{currentUser.email}</div></div>
            </div>
            <button onClick={()=>{setEditOpen(true);setProfileOpen(false);}} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-zinc-400 hover:bg-magenta/[.05] hover:text-rose"><UserRound className="h-4 w-4"/>Edit profile</button>
            <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-zinc-400 hover:bg-magenta/[.05] hover:text-rose"><Settings className="h-4 w-4"/>Settings & branding</Link>
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-zinc-500 hover:bg-red-500/[.05] hover:text-red-300"><LogOut className="h-4 w-4"/>Log out</button>
          </div>}
        </div>
      </div>
    </header>

    <main className={cn(
      'relative z-10 min-h-screen pt-16 transition-[padding] duration-300',
      collapsed?'md:pl-[72px]':'md:pl-[224px]'
    )}>
      {children}
    </main>

    {editOpen&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <button className="absolute inset-0" onClick={()=>setEditOpen(false)} aria-label="Close"/>
      <div className="relative w-full max-w-md rounded-[24px] border border-white/[.075] bg-[#101012] p-6 shadow-2xl">
        <div className="flex items-center gap-3"><Avatar user={currentUser} size={46}/><div><h2 className="font-heading text-lg text-zinc-100">Edit profile</h2><p className="text-xs text-zinc-600">{currentUser.email}</p></div></div>
        <label className="mt-6 block text-xs text-zinc-500">Display name<input value={name} onChange={e=>setName(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/[.07] bg-black/30 px-3 text-sm outline-none focus:border-magenta/25"/></label>
        <div className="mt-6 flex justify-end gap-2"><button onClick={()=>setEditOpen(false)} className="rounded-full px-4 py-2 text-xs text-zinc-500">Cancel</button><button disabled={saving} onClick={saveProfile} className="glow-action rounded-full px-5 py-2 text-xs">{saving?'Saving…':'Save profile'}</button></div>
      </div>
    </div>}
  </div>;
}
