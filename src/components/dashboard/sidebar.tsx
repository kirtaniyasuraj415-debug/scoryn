"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { BarChart3, CreditCard, FileSearch, LogOut, Palette, ScanSearch, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFirebaseClient } from '@/lib/firebase/client';

const items=[
  ['/dashboard',BarChart3,'Overview'],
  ['/dashboard/audit/new',FileSearch,'New audit'],
  ['/dashboard/clients',Users,'Clients'],
  ['/dashboard/settings',Palette,'Branding'],
  ['/dashboard/billing',CreditCard,'Billing']
] as const;

export function Sidebar(){
  const p=usePathname();
  const r=useRouter();

  async function logout(){
    const {auth}=getFirebaseClient();
    await signOut(auth);
    r.replace('/');
  }

  return <aside className="relative hidden h-screen w-64 shrink-0 border-r border-white/[.07] bg-[#090909] p-4 lg:block">
    <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3 font-heading font-bold">
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-magenta/30 bg-gradient-to-br from-[#6f0c42] via-[#a81560] to-[#d33a86] text-white shadow-[0_0_28px_rgba(197,29,111,.18)]">
        <ScanSearch className="h-4 w-4"/>
      </span>
      Scoryn
    </Link>

    <nav className="mt-8 space-y-1">
      {items.map(([href,Icon,label])=><Link
        key={href}
        href={href}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-magenta/[.04] hover:text-rose',
          p===href&&'bg-magenta/[.075] text-rose'
        )}
      >
        <Icon className="h-4 w-4"/>
        {label}
      </Link>)}
    </nav>

    <div className="absolute bottom-5 left-4">
      <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-magenta/[.04] hover:text-rose">
        <LogOut className="h-4 w-4"/>
        Log out
      </button>
    </div>
  </aside>;
}
