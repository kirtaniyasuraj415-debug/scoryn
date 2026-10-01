"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getFirebaseClient } from '@/lib/firebase/client';
import { ensureClientWorkspace } from '@/lib/auth/client-workspace';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';

export function DashboardShell({children}:{children:React.ReactNode}) {
  const router=useRouter();
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const {auth}=getFirebaseClient();
    const unsubscribe=onAuthStateChanged(auth,async user=>{
      if(!user){
        router.replace('/login');
        return;
      }

      try {
        await ensureClientWorkspace(user);
      } catch(e) {
        console.warn('Workspace bootstrap unavailable:', e);
      }

      setReady(true);
    });

    return unsubscribe;
  },[router]);

  if(!ready){
    return <div className="grid min-h-screen place-items-center bg-[#070707] text-white">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <LoaderCircle className="h-4 w-4 animate-spin text-rose"/>
        Opening your Scoryn workspace...
      </div>
    </div>;
  }

  return <div className="flex min-h-screen bg-[#070707] text-white">
    <Sidebar/>
    <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
    <MobileNav/>
  </div>;
}
