"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import {
  ArrowUp,
  Bot,
  FileSearch,
  Globe2,
  LoaderCircle,
  Paperclip,
  Sparkles,
  WandSparkles
} from 'lucide-react';
import { ScorynMark } from '@/components/brand/scoryn-mark';
import { getFirebaseClient } from '@/lib/firebase/client';

type ChatMessage={role:'user'|'assistant';content:string};

export const NVIDIA_MODELS=[
  {id:'meta/llama-3.2-1b-instruct',label:'Llama 3.2 1B',hint:'Ultra fast'},
  {id:'meta/llama-3.1-8b-instruct',label:'Llama 3.1 8B',hint:'Fast'},
  {id:'deepseek-ai/deepseek-v4-flash',label:'DeepSeek V4 Flash',hint:'Flash'},
  {id:'stepfun-ai/step-3.5-flash',label:'Step 3.5 Flash',hint:'Flash'},
  {id:'openai/gpt-oss-20b',label:'GPT-OSS 20B',hint:'Reasoning'}
] as const;

function findUrl(text:string){
  const explicit=text.match(/https?:\/\/[^\s]+/i)?.[0];
  if(explicit) return explicit.replace(/[),.;]+$/,'');
  const naked=text.trim().match(/^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?::\d+)?(?:\/\S*)?$/i)?.[0];
  return naked ? (naked.startsWith('http')?naked:`https://${naked}`) : null;
}

export function AssistantWorkspace(){
  const router=useRouter();
  const [displayName,setDisplayName]=useState('');
  const [input,setInput]=useState('');
  const [model,setModel]=useState<string>(NVIDIA_MODELS[0].id);
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState('');
  const inputRef=useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{
    const {auth}=getFirebaseClient();
    const unsubscribe=onAuthStateChanged(auth,user=>setDisplayName(user?.displayName||''));
    const profileUpdated=(event:Event)=>{
      const custom=event as CustomEvent<{displayName?:string|null}>;
      setDisplayName(custom.detail?.displayName||'');
    };
    window.addEventListener('scoryn-profile-updated',profileUpdated);
    return ()=>{
      unsubscribe();
      window.removeEventListener('scoryn-profile-updated',profileUpdated);
    };
  },[]);

  useEffect(()=>{
    try{
      const saved=localStorage.getItem('scoryn_model');
      if(saved&&NVIDIA_MODELS.some(m=>m.id===saved)) setModel(saved);
      const chat=localStorage.getItem('scoryn_chat');
      if(chat) setMessages(JSON.parse(chat));
    }catch{}
  },[]);

  useEffect(()=>{
    try{
      localStorage.setItem('scoryn_model',model);
      localStorage.setItem('scoryn_chat',JSON.stringify(messages.slice(-12)));
    }catch{}
  },[model,messages]);

  const firstName=useMemo(()=>{
    const clean=displayName.trim();
    return clean?clean.split(/\s+/)[0]:'there';
  },[displayName]);

  async function send(raw?:string){
    const text=(raw??input).trim();
    if(!text||busy) return;
    setInput('');
    setMessages(prev=>[...prev,{role:'user',content:text}]);
    setBusy(true);

    const url=findUrl(text);
    if(url){
      setStatus('Website detected — starting audit…');
      try{
        const res=await fetch('/api/audit/demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url})});
        const data=await res.json();
        if(!res.ok) throw new Error(data.error||'Audit could not start.');
        setStatus('Audit ready — opening report…');
        router.push(`/demo/${data.id}`);
        return;
      }catch(e){
        const msg=e instanceof Error?e.message:'Audit failed.';
        setMessages(prev=>[...prev,{role:'assistant',content:`Audit start nahi hua: ${msg}`}]);
      }finally{
        setBusy(false);
        setStatus('');
      }
      return;
    }

    setStatus('Thinking…');
    try{
      const res=await fetch('/api/assistant/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:text,model})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||'AI response failed.');
      setMessages(prev=>[...prev,{role:'assistant',content:data.reply}]);
    }catch(e){
      setMessages(prev=>[...prev,{role:'assistant',content:e instanceof Error?e.message:'Something went wrong.'}]);
    }finally{
      setBusy(false);
      setStatus('');
    }
  }

  function submit(e:FormEvent){e.preventDefault();void send();}

  const suggestions=[
    {icon:FileSearch,title:'Audit a website',copy:'Paste any public URL',prompt:'https://example.com'},
    {icon:Sparkles,title:'Explain an issue',copy:'Client-friendly explanation',prompt:'Explain why a slow LCP matters to a business owner.'},
    {icon:WandSparkles,title:'Write a client pitch',copy:'Short outreach angle',prompt:'Write a short website redesign pitch for an interior design business.'}
  ];

  return <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-black">
    <div className="hero-grid pointer-events-none absolute inset-0 opacity-55"/>
    <div className="noise pointer-events-none absolute inset-0 opacity-[.14]"/>
    <div className="hero-ambient-glow pointer-events-none absolute left-1/2 top-[46%] h-[520px] w-[880px] -translate-x-1/2 rounded-full"/>

    <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1040px] flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-magenta/25 bg-[#10090d]/80 shadow-[0_0_42px_rgba(197,29,111,.18)] sm:h-16 sm:w-16">
        <ScorynMark size={42} className="border-0 bg-transparent shadow-none"/>
      </div>

      <p className="text-xs text-zinc-500">Hi, {firstName}</p>
      <h1 className="mt-2 font-heading text-balance text-[2rem] font-bold leading-[1.02] tracking-[-.05em] sm:text-[3.1rem]">
        What&apos;s on your mind?
      </h1>
      <p className="mt-3 max-w-xl text-balance text-sm leading-6 text-zinc-600">
        Website URL paste karo to Scoryn automatically audit start karega. Normal question pucho to AI copilot answer karega.
      </p>

      {messages.length>0&&<div className="mx-auto mt-7 w-full max-w-[760px] space-y-3 text-left">
        {messages.slice(-4).map((m,i)=><div key={i} className={m.role==='user'
          ?'ml-auto max-w-[84%] rounded-2xl rounded-br-md border border-magenta/15 bg-magenta/[.055] px-4 py-3 text-sm leading-6 text-zinc-200'
          :'mr-auto max-w-[88%] rounded-2xl rounded-bl-md border border-white/[.06] bg-[#0d0d0d]/90 px-4 py-3 text-sm leading-6 text-zinc-400'}>
          {m.content}
        </div>)}
      </div>}

      <form onSubmit={submit} className="audit-shell mx-auto mt-8 w-full max-w-[760px] rounded-[22px] p-px text-left">
        <div className="relative overflow-hidden rounded-[21px] bg-[#090909]/95 p-3.5 sm:p-4">
          <div className="audit-box-glow pointer-events-none absolute inset-0"/>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send();}}}
            rows={2}
            placeholder="Ask anything or paste a client website URL…"
            className="relative z-10 min-h-[78px] w-full resize-none bg-transparent px-2 pt-1 text-[15px] leading-6 text-white outline-none placeholder:text-zinc-600"
          />

          <div className="relative z-10 mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <button type="button" title="Attachments will be connected with the report file pipeline" className="grid h-9 w-9 place-items-center rounded-full border border-white/[.07] bg-white/[.025] text-zinc-600 transition hover:border-magenta/20 hover:text-rose">
                <Paperclip className="h-4 w-4"/>
              </button>

              <label className="flex h-9 max-w-[230px] items-center gap-2 rounded-full border border-white/[.07] bg-white/[.025] px-3 text-[11px] text-zinc-500">
                <Bot className="h-3.5 w-3.5 shrink-0 text-rose"/>
                <select value={model} onChange={e=>setModel(e.target.value)} className="min-w-0 max-w-[170px] bg-transparent text-zinc-300 outline-none">
                  {NVIDIA_MODELS.map(m=><option className="bg-[#101010]" key={m.id} value={m.id}>{m.label} · {m.hint}</option>)}
                </select>
              </label>

              <span className="hidden h-9 items-center gap-1.5 rounded-full border border-white/[.07] bg-white/[.025] px-3 text-[10px] text-zinc-600 md:flex">
                <Globe2 className="h-3.5 w-3.5"/>URL auto-detect
              </span>
            </div>

            <button type="submit" disabled={!input.trim()||busy} className="glow-action group relative grid h-10 w-10 place-items-center overflow-hidden rounded-full disabled:opacity-35">
              <span className="button-sheen absolute inset-y-0 -left-12 w-10 -skew-x-12 bg-white/25 blur-sm"/>
              {busy?<LoaderCircle className="relative h-4 w-4 animate-spin"/>:<ArrowUp className="relative h-4 w-4"/>}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-3 h-5 text-[10px] text-zinc-700">{status}</div>

      <div className="mt-3 grid w-full max-w-[760px] gap-2 sm:grid-cols-3">
        {suggestions.map(({icon:Icon,title,copy,prompt})=><button key={title} onClick={()=>{setInput(prompt);inputRef.current?.focus();}} className="group rounded-2xl border border-white/[.05] bg-black/35 p-3.5 text-left backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-magenta/20 hover:bg-magenta/[.025]">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-magenta/15 bg-magenta/[.055] text-rose"><Icon className="h-4 w-4"/></span>
            <div className="min-w-0"><h3 className="font-heading text-xs font-bold">{title}</h3><p className="mt-0.5 truncate text-[10px] text-zinc-600">{copy}</p></div>
          </div>
        </button>)}
      </div>
    </div>
  </section>;
}
