"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase/client';

export default function FeedbackPage(){
  const [backHref,setBackHref]=useState('/');
  const [backLabel,setBackLabel]=useState('← Back to Scoryn');

  useEffect(()=>{
    const {auth}=getFirebaseClient();
    return onAuthStateChanged(auth,user=>{
      if(user){
        setBackHref('/dashboard');
        setBackLabel('← Back to dashboard');
      }else{
        setBackHref('/');
        setBackLabel('← Back to Scoryn');
      }
    });
  },[]);

  return <main className="min-h-screen bg-black px-5 py-12 text-white sm:px-8 sm:py-16">
    <div className="mx-auto max-w-xl">
      <Link href={backHref} className="text-xs text-zinc-500 transition hover:text-rose">{backLabel}</Link>

      <div className="mt-10">
        <p className="text-[10px] uppercase tracking-[.24em] text-rose">Beta feedback</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Help us improve Scoryn.</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-500">
          Scoryn is actively being tested. If an audit, report, PDF, login flow, or another feature behaves unexpectedly, tell us what happened.
        </p>
      </div>

      <div className="reference-card mt-8 rounded-[24px] p-6 sm:p-7">
        <p className="text-sm leading-7 text-zinc-300">
          Include the page you were using, what you expected, what happened instead, and the audit URL if relevant.
        </p>
        <a
          href="https://github.com/kirtaniyasuraj415-debug/scoryn/issues/new"
          target="_blank"
          rel="noreferrer"
          className="glow-action mt-6 inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
        >
          Report an issue on GitHub
        </a>
        <p className="mt-3 text-[11px] text-zinc-700">
          Do not include passwords, API keys, payment credentials, or other secrets.
        </p>
      </div>
    </div>
  </main>;
}
