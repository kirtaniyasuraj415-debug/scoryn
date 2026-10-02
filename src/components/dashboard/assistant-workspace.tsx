"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import {
  ArrowUp,
  Bot,
  FileSearch,
  Globe2,
  LoaderCircle,
  MessageSquarePlus,
  Paperclip,
  Sparkles,
  WandSparkles
} from 'lucide-react';
import { ScorynMark } from '@/components/brand/scoryn-mark';
import { getFirebaseClient } from '@/lib/firebase/client';

type ChatMessage={role:'user'|'assistant';content:string};
type ChatSession={id:string;title:string;messages:ChatMessage[];updatedAt:number};

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

function cleanSessions(value:any):ChatSession[]{
  if(!Array.isArray(value)) return [];
  return value.filter(Boolean).map((s:any)=>({
    id:String(s.id||`chat_${Date.now()}`),
    title:String(s.title||'Untitled chat'),
    messages:Array.isArray(s.messages)?s.messages.filter((m:any)=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'):[],
    updatedAt:Number(s.updatedAt||0)
  }));
}

export function AssistantWorkspace(){
  const router=useRouter();
  const searchParams=useSearchParams();
  const [displayName,setDisplayName]=useState('');
  const [input,setInput]=useState('');
  const [model,setModel]=useState<string>(NVIDIA_MODELS[0].id);
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [sessions,setSessions]=useState<ChatSession[]>([]);
  const [currentId,setCurrentId]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState('');
  const inputRef=useRef<HTMLTextAreaElement>(null);
  const endRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const {auth}=getFirebaseClient();
    const unsubscribe=onAuthStateChanged(auth,user=>setDisplayName(user?.displayName||''));
    const profileUpdated=(event:Event)=>{
      const custom=event as CustomEvent<{displayName?:string|null}>;
      setDisplayName(custom.detail?.displayName||'');
    };
    window.addEventListener('scoryn-profile-updated',profileUpdated);

    try{
      const saved=localStorage.getItem('scoryn_model');
      if(saved&&NVIDIA_MODELS.some(m=>m.id===saved)) setModel(saved);

      let loaded=cleanSessions(JSON.parse(localStorage.getItem('scoryn_chat_sessions')||'[]'));
      if(!loaded.length){
        const old=JSON.parse(localStorage.getItem('scoryn_chat')||'[]');
        if(Array.isArray(old)&&old.length){
          loaded=[{
            id:`chat_${Date.now()}`,
            title:String(old.find((m:any)=>m?.role==='user')?.content||'Previous chat').slice(0,42),
            messages:old,
            updatedAt:Date.now()
          }];
          localStorage.setItem('scoryn_chat_sessions',JSON.stringify(loaded));
        }
      }
      setSessions(loaded);

      const requested=searchParams.get('chat');
      if(requested){
        const match=loaded.find(s=>s.id===requested);
        if(match){setCurrentId(match.id);setMessages(match.messages);}
      }
    }catch{}

    return ()=>{
      unsubscribe();
      window.removeEventListener('scoryn-profile-updated',profileUpdated);
    };
  },[]);

  useEffect(()=>{
    const requested=searchParams.get('chat');
    if(!requested){
      if(currentId){setCurrentId(null);setMessages([]);}
      return;
    }
    const match=sessions.find(s=>s.id===requested);
    if(match&&match.id!==currentId){
      setCurrentId(match.id);
      setMessages(match.messages);
    }
  },[searchParams,sessions,currentId]);

  useEffect(()=>{
    try{localStorage.setItem('scoryn_model',model);}catch{}
  },[model]);

  useEffect(()=>{
    if(messages.length) endRef.current?.scrollIntoView({behavior:'smooth',block:'end'});
  },[messages,busy]);

  const firstName=useMemo(()=>{
    const clean=displayName.trim();
    return clean?clean.split(/\s+/)[0]:'there';
  },[displayName]);

  function persist(next:ChatSession[]){
    const sorted=[...next].sort((a,b)=>b.updatedAt-a.updatedAt);
    setSessions(sorted);
    try{
      localStorage.setItem('scoryn_chat_sessions',JSON.stringify(sorted.slice(0,30)));
      window.dispatchEvent(new Event('scoryn-chat-history-updated'));
    }catch{}
  }

  function commitMessages(nextMessages:ChatMessage[], forcedId?:string|null){
    let id=forcedId||currentId;
    if(!id){
      id=`chat_${Date.now()}`;
      setCurrentId(id);
      router.replace(`/dashboard/ai?chat=${encodeURIComponent(id)}`,{scroll:false});
    }

    const firstUser=nextMessages.find(m=>m.role==='user')?.content||'New chat';
    const session:ChatSession={
      id,
      title:firstUser.replace(/https?:\/\//i,'').slice(0,42),
      messages:nextMessages.slice(-40),
      updatedAt:Date.now()
    };
    persist([session,...sessions.filter(s=>s.id!==id)]);
    setMessages(nextMessages);
    return id;
  }

  function startNewChat(){
    setMessages([]);
    setCurrentId(null);
    setInput('');
    setStatus('');
    router.replace('/dashboard/ai',{scroll:false});
    setTimeout(()=>inputRef.current?.focus(),50);
  }

  async function send(raw?:string){
    const text=(raw??input).trim();
    if(!text||busy) return;

    setInput('');
    const withUser=[...messages,{role:'user' as const,content:text}];
    const sessionId=commitMessages(withUser);
    setBusy(true);

    const url=findUrl(text);
    if(url){
      setStatus('Website detected — starting audit…');
      try{
        const res=await fetch('/api/audit/demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url})});
        const data=await res.json();
        if(!res.ok) throw new Error(data.error||'Audit could not start.');
        commitMessages([...withUser,{role:'assistant',content:`Audit started for ${url}. Opening the report now.`}],sessionId);
        setStatus('Audit ready — opening report…');
        router.push(`/demo/${data.id}`);
        return;
      }catch(e){
        const msg=e instanceof Error?e.message:'Audit failed.';
        commitMessages([...withUser,{role:'assistant',content:`Audit start nahi hua: ${msg}`}],sessionId);
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
      commitMessages([...withUser,{role:'assistant',content:data.reply}],sessionId);
    }catch(e){
      commitMessages([...withUser,{role:'assistant',content:e instanceof Error?e.message:'Something went wrong.'}],sessionId);
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

  const hasConversation=messages.length>0;

  const PromptBox=({compact=false}:{compact?:boolean})=><form onSubmit={submit} className="audit-shell mx-auto w-full max-w-[780px] rounded-[22px] p-px text-left">
    <div className="relative overflow-hidden rounded-[21px] bg-[#050505] p-3.5 sm:p-4">
      <textarea
        ref={inputRef}
        value={input}
        onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send();}}}
        rows={compact?1:2}
        placeholder="Ask anything or paste a client website URL…"
        className={`relative z-10 w-full resize-none bg-transparent px-2 pt-1 text-[14px] font-normal leading-6 text-white outline-none placeholder:text-zinc-700 ${compact?'min-h-[52px]':'min-h-[78px]'}`}
      />
      <div className="relative z-10 mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-white/[.06] bg-[#0a0a0a] text-zinc-600 transition hover:border-magenta/20 hover:text-rose">
            <Paperclip className="h-4 w-4"/>
          </button>
          <label className="flex h-9 max-w-[230px] items-center gap-2 rounded-full border border-white/[.06] bg-[#0a0a0a] px-3 text-[10px] text-zinc-500">
            <Bot className="h-3.5 w-3.5 shrink-0 text-rose"/>
            <select value={model} onChange={e=>setModel(e.target.value)} className="min-w-0 max-w-[170px] bg-transparent text-zinc-300 outline-none">
              {NVIDIA_MODELS.map(m=><option className="bg-[#101010]" key={m.id} value={m.id}>{m.label} · {m.hint}</option>)}
            </select>
          </label>
          <span className="hidden h-9 items-center gap-1.5 rounded-full border border-white/[.06] bg-[#0a0a0a] px-3 text-[10px] text-zinc-600 md:flex">
            <Globe2 className="h-3.5 w-3.5"/>URL auto-detect
          </span>
        </div>
        <button type="submit" disabled={!input.trim()||busy} className="glow-action grid h-10 w-10 place-items-center rounded-full disabled:opacity-35">
          {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<ArrowUp className="h-4 w-4"/>}
        </button>
      </div>
    </div>
  </form>;

  if(!hasConversation){
    return <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-[.25]"/>
      <div className="hero-ambient-glow pointer-events-none absolute left-1/2 top-[52%] h-[540px] w-[900px] -translate-x-1/2 rounded-full opacity-55"/>
      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[780px] text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-magenta/20 bg-[#0b090a] shadow-[0_0_34px_rgba(197,29,111,.14)]">
            <ScorynMark size={40} className="border-0 shadow-none"/>
          </div>
          <p className="text-xs text-zinc-500">Hi, {firstName}</p>
          <h1 className="mt-2 font-heading text-[2rem] leading-[1.05] text-zinc-100 sm:text-[3rem]">What&apos;s on your mind?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600">Website URL paste karo to audit automatically start hoga. Normal question pucho to Scoryn AI copilot answer karega.</p>
          <div className="mt-8"><PromptBox/></div>
          <div className="mt-3 h-5 text-[10px] text-zinc-700">{status}</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {suggestions.map(({icon:Icon,title,copy,prompt})=><button key={title} onClick={()=>{setInput(prompt);inputRef.current?.focus();}} className="group rounded-2xl border border-white/[.05] bg-black/35 p-3.5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-magenta/20 hover:bg-magenta/[.025]">
              <div className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-magenta/15 bg-magenta/[.055] text-rose"><Icon className="h-4 w-4"/></span><div className="min-w-0"><h3 className="font-heading text-xs text-zinc-200">{title}</h3><p className="mt-0.5 truncate text-[10px] text-zinc-600">{copy}</p></div></div>
            </button>)}
          </div>
        </div>
      </div>
    </section>;
  }

  return <section className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden">
    <div className="hero-grid pointer-events-none absolute inset-0 opacity-[.16]"/>
    <div className="relative mx-auto flex w-full max-w-[980px] flex-1 flex-col px-4 sm:px-6">
      <div className="flex items-center justify-between border-b border-white/[.045] py-4">
        <div className="min-w-0"><div className="truncate text-xs text-zinc-300">{sessions.find(s=>s.id===currentId)?.title||'Current chat'}</div><div className="mt-1 text-[9px] text-zinc-700">Scoryn AI Workspace</div></div>
        <button onClick={startNewChat} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[.06] bg-white/[.018] px-3 text-[10px] text-zinc-500 transition hover:border-magenta/15 hover:text-rose"><MessageSquarePlus className="h-3.5 w-3.5"/>New chat</button>
      </div>

      <div className="flex-1 py-8">
        <div className="mx-auto max-w-[780px] space-y-5">
          {messages.map((m,i)=><div key={i} className={m.role==='user'?'flex justify-end':'flex justify-start'}>
            <div className={m.role==='user'
              ?'max-w-[82%] rounded-[20px] rounded-br-md border border-magenta/12 bg-magenta/[.055] px-4 py-3 text-sm font-normal leading-7 text-zinc-200'
              :'max-w-[88%] rounded-[20px] rounded-bl-md border border-white/[.055] bg-[#0c0c0d] px-4 py-3 text-sm font-normal leading-7 text-zinc-400'}>
              {m.content}
            </div>
          </div>)}
          {busy&&<div className="flex justify-start"><div className="flex items-center gap-2 rounded-full border border-white/[.05] bg-[#0c0c0d] px-3 py-2 text-[10px] text-zinc-600"><LoaderCircle className="h-3.5 w-3.5 animate-spin text-rose"/>{status||'Thinking…'}</div></div>}
          <div ref={endRef}/>
        </div>
      </div>

      <div className="chat-bottom-fade sticky bottom-0 -mx-4 px-4 pb-5 pt-10 sm:-mx-6 sm:px-6">
        <PromptBox compact/>
        <div className="mt-2 text-center text-[9px] text-zinc-800">Scoryn can make mistakes. Verify important audit recommendations.</div>
      </div>
    </div>
  </section>;
}
