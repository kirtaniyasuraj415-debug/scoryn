"use client";

import { CheckCircle2, Gauge, ReceiptText, ShieldCheck } from 'lucide-react';

const plans=[
  ['Free','₹0','3 audits / month',['Demo audit','Basic reports','Scoryn branding']],
  ['Pro','₹499','50 audits / month',['Custom branding','PDF reports','Client workspace']],
  ['Agency','₹999','Fair-use unlimited',['5 team members','Priority processing','Advanced branding']]
] as const;

export default function Billing(){
  return <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-6xl px-4 py-10 pb-20 sm:px-8 lg:py-14">
    <p className="text-[10px] uppercase tracking-[.24em] text-rose">Plans & billing</p>
    <h1 className="mt-2 font-heading text-3xl font-bold tracking-[-.035em] sm:text-4xl">Plan & usage</h1>

    <div className="mt-4 rounded-2xl border border-magenta/15 bg-magenta/[.035] p-4 text-sm leading-6 text-zinc-400">
      <span className="font-semibold text-rose">Paid upgrades are not enabled yet.</span> This page shows the current plan structure while production billing is being completed and verified.
    </div>

    <div className="mt-8 grid gap-3 lg:grid-cols-3">
      {plans.map(([name,price,sub,items],i)=><div key={name} className="reference-card rounded-[24px] p-6">
        <div className="flex items-center justify-between"><h2 className="font-heading text-xl font-bold">{name}</h2>{i===0&&<span className="rounded-full border border-magenta/20 bg-magenta/[.06] px-2.5 py-1 text-[9px] text-rose">Current</span>}</div>
        <div className="mt-8 font-heading text-4xl font-bold">{price}</div>
        <div className="mt-1 text-xs text-zinc-600">{sub}</div>
        <div className="my-6 h-px bg-white/[.05]"/>
        <div className="space-y-3">{items.map(x=><div key={x} className="flex items-center gap-2 text-sm text-zinc-400"><CheckCircle2 className="h-4 w-4 text-rose"/>{x}</div>)}</div>
        <button disabled className="mt-8 h-10 w-full cursor-not-allowed rounded-full border border-magenta/10 bg-magenta/[.035] text-xs text-zinc-600">{i===0?'Current plan':'Coming soon'}</button>
      </div>)}
    </div>

    <div className="mt-6 grid gap-3 md:grid-cols-3">
      {[
        [Gauge,'Usage visibility','Audit count and plan allowance stay visible before any upgrade decision.'],
        [ReceiptText,'Billing history','Payment history and invoices will be enabled with the production billing rollout.'],
        [ShieldCheck,'Server-verified payments','Plan upgrades are only applied after server-side verification.']
      ].map(([Icon,title,copy])=><div key={title as string} className="reference-card rounded-[22px] p-5">
        <Icon className="h-4 w-4 text-rose"/>
        <h3 className="mt-8 font-heading text-sm font-bold">{title as string}</h3>
        <p className="mt-2 text-xs leading-6 text-zinc-600">{copy as string}</p>
      </div>)}
    </div>
  </div>;
}
