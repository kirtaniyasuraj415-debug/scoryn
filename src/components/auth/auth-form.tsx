"use client";

import { FormEvent, useState } from 'react';
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

function friendlyAuthError(error:unknown){
  const code=(error as any)?.code;
  if(code==='auth/invalid-credential'||code==='auth/wrong-password'||code==='auth/user-not-found') return 'Email ya password sahi nahi hai.';
  if(code==='auth/email-already-in-use') return 'Is email se account already bana hua hai. Log in karo.';
  if(code==='auth/weak-password') return 'Password kam se kam 6 characters ka rakho.';
  if(code==='auth/invalid-email') return 'Valid email address enter karo.';
  if(code==='auth/popup-closed-by-user') return 'Google sign-in cancel ho gaya.';
  if(code==='auth/popup-blocked') return 'Browser ne Google sign-in popup block kiya. Popup allow karke retry karo.';
  if(code==='auth/unauthorized-domain') return 'Is website domain ko Firebase Authentication me allow karna hoga.';
  if(error instanceof Error&&error.message) return error.message;
  return 'Sign-in complete nahi hua. Please retry.';
}

export function AuthForm({mode}:{mode:'login'|'signup'}){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const router=useRouter();

  async function finish(user:any){
    const idToken=await user.getIdToken(true);
    const sessionRes=await fetch('/api/auth/session',{
      method:'POST',
      headers:{'content-type':'application/json'},
      credentials:'same-origin',
      body:JSON.stringify({idToken})
    });
    if(!sessionRes.ok){
      const data=await sessionRes.json().catch(()=>({}));
      throw new Error(data.error||'Secure sign-in session create nahi hui.');
    }

    try{
      await ensureClientWorkspace(user);
    }catch(e){
      console.warn('Workspace bootstrap continued in background:',e);
    }

    router.replace('/dashboard');
    router.refresh();
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    setBusy(true);
    setError('');

    try{
      const {auth}=getFirebaseClient();
      if(mode==='signup'){
        const c=await createUserWithEmailAndPassword(auth,email,password);
        if(name.trim()) await updateProfile(c.user,{displayName:name.trim()});
        await finish(c.user);
      }else{
        const c=await signInWithEmailAndPassword(auth,email,password);
        await finish(c.user);
      }
    }catch(e){
      setError(friendlyAuthError(e));
      setBusy(false);
    }
  }

  async function google(){
    setBusy(true);
    setError('');

    try{
      const {auth}=getFirebaseClient();
      const provider=new GoogleAuthProvider();
      provider.setCustomParameters({prompt:'select_account'});
      const c=await signInWithPopup(auth,provider);
      await finish(c.user);
    }catch(e){
      setError(friendlyAuthError(e));
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
    {error&&<p role="alert" className="text-sm text-rose-300">{error}</p>}
  </form>;
}
