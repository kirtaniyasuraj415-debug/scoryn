"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUp,
  Bot,
  FileSearch,
  Globe2,
  LoaderCircle,
  MessageSquareText,
  Paperclip,
  Sparkles,
  WandSparkles
} from 'lucide-react';
import { ScorynMark } from '@/components/brand/scoryn-mark';

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

export function AssistantWorkspace({displayName}:{displayName?:string|null}){
  const router=useRouter();
  const [input,setInput]=useState('');
  const [model,setModel]=useState<string>(NVIDIA_MODELS[0].id);
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState('');
  const inputRef=useRef<HTMLTextAreaElement>(null);

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

  const firstName=useMemo(()=>displayName?.trim().split(/\s+/)[0]||'there',[displayName]);

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
    {icon:Sparkles,title:'Explain an issue',copy:'Turn tech into client language',prompt:'Explain why a slow LCP matters to a business owner.'},
    {icon:WandSparkles,title:'Write a client pitch',copy:'Create a short outreach angle',prompt:'Write a short website redesign pitch for an interior design business.'}
  ];

  return <section className="mx-auto flex w-full max-w-[980px] flex-col px-4 pb-12 pt-10 sm:px-6 lg:pt-16">
    <div className="flex flex-col items-center text-center">
      <div className="scoryn-orb relative grid h-20 w-20 place-items-center sm:h-24 sm:w-24">
        <div className="absolute inset-0 rounded-full bg-magenta/25 blur-2xl"/>
        <div className="orb-surface absolute inset-[7px] rounded-full"/>
        <ScorynMark size={44} className="relative border-0 bg-transparent shadow-none sm:scale-110"/>
      </div>
      <p className="mt-5 text-xs text-zinc-600">Good to see you, {firstName}</p>
      <h1 className="mt-2 font-heading text-[2rem] font-bold tracking-[-.045em] sm:text-[2.7rem]">WHAT&apos;S ON YOUR MIND?</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">Paste a website and Scoryn audits it automatically — or ask a normal question and use it like an AI copilot.</p>
    </div>

    {messages.length>0&&<div className="mx-auto mt-8 w-full max-w-[760px] space-y-3">
      {messages.slice(-4).map((m,i)=><div key={i} className={m.role==='user'?'ml-auto max-w-[84%] rounded-2xl rounded-br-md border border-magenta/15 bg-magenta/[.055] px-4 py-3 text-sm leading-6 text-zinc-200':'mr-auto max-w-[88%] rounded-2xl rounded-bl-md border border-white/[.06] bg-[#0d0d0d] px-4 py-3 text-sm leading-6 text-zinc-400'}>
        {m.content}
      </div>)}
    </div>}

    <form onSubmit={submit} className="assistant-prompt-shell mx-auto mt-8 w-full max-w-[760px] rounded-[22px] p-px">
      <div className="relative overflow-hidden rounded-[21px] bg-[#0d0d0f]/95 p-3 sm:p-4">
        <div className="assistant-prompt-glow pointer-events-none absolute inset-0"/>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send();}}}
          rows={2}
          placeholder="Ask anything or paste a client website URL…"
          className="relative z-10 min-h-[78px] w-full resize-none bg-transparent px-2 pt-1 text-[15px] leading-6 text-white outline-none placeholder:text-zinc-700"
        />

        <div className="relative z-10 mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button type="button" title="Attachment support coming with the audit file pipeline" className="grid h-9 w-9 place-items-center rounded-full border border-white/[.07] bg-white/[.025] text-zinc-600 transition hover:border-magenta/20 hover:text-rose">
              <Paperclip className="h-4 w-4"/>
            </button>

            <label className="flex h-9 items-center gap-2 rounded-full border border-white/[.07] bg-white/[.025] px-3 text-[11px] text-zinc-500">
              <Bot className="h-3.5 w-3.5 text-rose"/>
              <select value={model} onChange={e=>setModel(e.target.value)} className="max-w-[160px] bg-transparent text-zinc-300 outline-none sm:max-w-[220px]">
                {NVIDIA_MODELS.map(m=><option className="bg-[#101010]" key={m.id} value={m.id}>{m.label} · {m.hint}</option>)}
              </select>
            </label>

            <span className="hidden h-9 items-center gap-1.5 rounded-full border border-white/[.07] bg-white/[.025] px-3 text-[10px] text-zinc-600 sm:flex">
              <Globe2 className="h-3.5 w-3.5"/> URL auto-detect
            </span>
          </div>

          <button type="submit" disabled={!input.trim()||busy} className="glow-action grid h-10 w-10 place-items-center rounded-full disabled:opacity-35">
            {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<ArrowUp className="h-4 w-4"/>}
          </button>
        </div>
      </div>
    </form>

    <div className="mx-auto mt-3 h-5 w-full max-w-[760px] text-center text-[10px] text-zinc-700">{status}</div>

    <div className="mx-auto mt-4 grid w-full max-w-[760px] gap-2 sm:grid-cols-3">
      {suggestions.map(({icon:Icon,title,copy,prompt})=><button key={title} onClick={()=>{setInput(prompt);inputRef.current?.focus();}} className="group rounded-2xl border border-white/[.055] bg-[#0c0c0d] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-magenta/20 hover:bg-magenta/[.025]">
        <div className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-lg border border-magenta/15 bg-magenta/[.055] text-rose"><Icon className="h-4 w-4"/></span><ArrowUp className="h-3.5 w-3.5 rotate-45 text-zinc-800 transition group-hover:text-rose"/></div>
        <h3 className="mt-5 font-heading text-sm font-bold">{title}</h3>
        <p className="mt-1 text-[11px] leading-5 text-zinc-600">{copy}</p>
      </button>)}
    </div>

    <div className="mx-auto mt-8 w-full max-w-[760px]">
      <div className="mb-3 flex items-center gap-2 text-xs text-zinc-650"><MessageSquareText className="h-4 w-4"/>Recent activity</div>
      <div className="rounded-2xl border border-white/[.05] bg-[#090909]">
        {(messages.filter(m=>m.role==='user').slice(-3).reverse().length?messages.filter(m=>m.role==='user').slice(-3).reverse():[
          {role:'user' as const,content:'Your recent audits and chats will appear here.'}
        ]).map((m,i)=><div key={i} className="flex items-center justify-between border-b border-white/[.04] px-4 py-3 text-xs text-zinc-600 last:border-0"><span className="truncate pr-4">{m.content}</span><span className="shrink-0 text-[9px] text-zinc-800">{i===0?'Now':'Recent'}</span></div>)}
      </div>
    </div>
  </section>;
}
