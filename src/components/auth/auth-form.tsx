"use client";

import { FormEvent, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase/client';
import { ensureClientWorkspace } from '@/lib/auth/client-workspace';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const router=useRouter();

  async function finish(user:any) {
    const idToken=await user.getIdToken();
    const sessionRes=await fetch('/api/auth/session',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({idToken})
    });
    if(!sessionRes.ok){
      const data=await sessionRes.json().catch(()=>({}));
      throw new Error(data.error||'Could not create a secure session.');
    }

    router.replace('/dashboard');
    router.refresh();

    void ensureClientWorkspace(user).catch((e)=>{
      console.warn('Workspace bootstrap continued in background:',e);
    });
  }

  async function submit(e:FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const {auth}=getFirebaseClient();

      if(mode==='signup'){
        const c=await createUserWithEmailAndPassword(auth,email,password);
        if(name) await updateProfile(c.user,{displayName:name});
        await finish(c.user);
      } else {
        const c=await signInWithEmailAndPassword(auth,email,password);
        await finish(c.user);
      }
    } catch(e) {
      setError(e instanceof Error ? e.message : 'Authentication failed.');
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    setError('');

    try {
      const {auth}=getFirebaseClient();
      const provider=new GoogleAuthProvider();
      provider.setCustomParameters({prompt:'select_account'});
      const c=await signInWithPopup(auth,provider);
      await finish(c.user);
    } catch(e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed.');
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="space-y-4">
    {mode==='signup'&&<Input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required/>}
    <Input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" required/>
    <Input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" minLength={6} required/>
    <Button disabled={busy} className="w-full">
      {busy&&<LoaderCircle className="h-4 w-4 animate-spin"/>}
      {mode==='signup'?'Create free account':'Log in'}
    </Button>
    <div className="flex items-center gap-3 py-1 text-xs text-zinc-600">
      <span className="h-px flex-1 bg-white/[.08]"/>OR<span className="h-px flex-1 bg-white/[.08]"/>
    </div>
    <Button type="button" onClick={google} disabled={busy} variant="outline" className="w-full">
      Continue with Google
    </Button>
    {error&&<p className="text-sm text-rose-300">{error}</p>}
  </form>;
}
