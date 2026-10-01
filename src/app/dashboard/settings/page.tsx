"use client";

import { useEffect, useState } from 'react';
import { Bot, Palette, Save, Sparkles } from 'lucide-react';

const models=[
  ['meta/llama-3.2-1b-instruct','Llama 3.2 1B · Ultra fast'],
  ['meta/llama-3.1-8b-instruct','Llama 3.1 8B · Fast'],
  ['deepseek-ai/deepseek-v4-flash','DeepSeek V4 Flash'],
  ['stepfun-ai/step-3.5-flash','Step 3.5 Flash'],
  ['openai/gpt-oss-20b','GPT-OSS 20B · Reasoning']
];

export default function Settings(){
  const [agency,setAgency]=useState('');
  const [color,setColor]=useState('#C51D6F');
  const [signature,setSignature]=useState('');
  const [language,setLanguage]=useState('HINGLISH');
  const [model,setModel]=useState(models[0][0]);
  const [saved,setSaved]=useState(false);

  useEffect(()=>{try{const raw=localStorage.getItem('scoryn_preferences');if(raw){const p=JSON.parse(raw);setAgency(p.agency||'');setColor(p.color||'#C51D6F');setSignature(p.signature||'');setLanguage(p.language||'HINGLISH');setModel(p.model||models[0][0]);}}catch{}},[]);

  function save(){
    try{
      localStorage.setItem('scoryn_preferences',JSON.stringify({agency,color,signature,language,model}));
      localStorage.setItem('scoryn_model',model);
      setSaved(true);setTimeout(()=>setSaved(false),1600);
    }catch{}
  }

  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
    <p className="text-[10px] uppercase tracking-[.24em] text-rose/70">Settings</p>
    <h1 className="mt-2 font-heading text-3xl font-bold">Branding & AI preferences</h1>
    <p className="mt-2 text-sm text-zinc-600">Customize the report identity and default NVIDIA model selector.</p>

    <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="rounded-[24px] border border-white/[.055] bg-[#0c0c0d] p-5 sm:p-6">
        <div className="flex items-center gap-2"><Palette className="h-4 w-4 text-rose"/><h2 className="font-heading text-sm font-bold">Report branding</h2></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-zinc-600">Agency name<input value={agency} onChange={e=>setAgency(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/[.06] bg-black/30 px-3 text-sm text-white outline-none focus:border-magenta/20"/></label>
          <label className="text-xs text-zinc-600">Primary color<div className="mt-2 flex gap-2"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-11 w-12 rounded-xl bg-transparent"/><input value={color} onChange={e=>setColor(e.target.value)} className="h-11 flex-1 rounded-xl border border-white/[.06] bg-black/30 px-3 text-sm outline-none"/></div></label>
          <label className="text-xs text-zinc-600">Report language<select value={language} onChange={e=>setLanguage(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/[.06] bg-[#0a0a0b] px-3 text-sm outline-none"><option>HINGLISH</option><option>ENGLISH</option><option>HINDI</option></select></label>
          <label className="text-xs text-zinc-600">Default AI model<select value={model} onChange={e=>setModel(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/[.06] bg-[#0a0a0b] px-3 text-sm outline-none">{models.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
        </div>
        <label className="mt-4 block text-xs text-zinc-600">Report CTA / signature<textarea value={signature} onChange={e=>setSignature(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-white/[.06] bg-black/30 p-3 text-sm outline-none focus:border-magenta/20" placeholder="Need these issues fixed? Contact us…"/></label>
        <button onClick={save} className="glow-action mt-5 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold"><Save className="h-4 w-4"/>{saved?'Saved':'Save preferences'}</button>
      </div>

      <div className="space-y-4">
        <div className="reference-card rounded-[24px] p-5">
          <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-rose"/><h2 className="font-heading text-sm font-bold">AI routing</h2></div>
          <p className="mt-3 text-xs leading-6 text-zinc-600">Selected model is tried first. If NVIDIA returns an error or timeout, Scoryn automatically tries the next fast model in the fallback chain.</p>
          <div className="mt-4 rounded-xl border border-magenta/15 bg-magenta/[.04] p-3 text-[11px] text-zinc-500"><Sparkles className="mr-2 inline h-3.5 w-3.5 text-rose"/>Fast-first fallback is already wired in the chat API.</div>
        </div>
        <div className="rounded-[24px] border border-white/[.055] bg-[#0c0c0d] p-5">
          <div className="text-[10px] uppercase tracking-[.2em] text-zinc-700">Live report preview</div>
          <div className="mt-5 rounded-2xl bg-[#f5f1f3] p-5 text-black">
            <div className="flex items-center justify-between"><b>{agency||'Your Agency'}</b><span className="text-[9px] text-zinc-500">AUDIT REPORT</span></div>
            <div className="mt-8 text-3xl font-bold">84</div><div className="text-xs text-zinc-500">Overall score</div>
            <div className="mt-3 h-1.5 rounded-full bg-zinc-200"><div className="h-full w-[84%] rounded-full" style={{backgroundColor:color}}/></div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
