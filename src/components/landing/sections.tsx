import { Bot, FileText, Palette, Users, Link2, Gauge, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const features = [
  [Gauge, 'Automated audit', 'PageSpeed data se performance, SEO, accessibility aur best-practice checks.'],
  [Bot, 'AI explanations', 'Technical issues ko business-owner friendly language mein convert karo.'],
  [Palette, 'Your branding', 'Agency logo, primary colour, contact details aur signature ke saath report.'],
  [Users, 'Client workspace', 'Clients, reports, share links aur audit history ek jagah manage karo.']
] as const;

export function FeatureSection() { return <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8"><div className="mb-10 max-w-2xl"><span className="text-xs uppercase tracking-[.28em] text-rose">Built for client work</span><h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-5xl">Audit se sales document tak. Ek workflow.</h2></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{features.map(([Icon,title,desc])=><Card key={title} className="bg-[#0c0b0c]"><CardContent className="p-6"><div className="mb-12 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.04]"><Icon className="h-4 w-4" /></div><h3 className="text-lg">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-500">{desc}</p></CardContent></Card>)}</div></section> }

export function HowSection() { const items=[['01','Paste URL','Client website ka URL dalo.'],['02','We analyze','Mobile + desktop audit aur AI explanation process hota hai.'],['03','Send report','Apni branding ke saath PDF ya public link share karo.']]; return <section id="how" className="border-y border-white/[.06] bg-[#080808]"><div className="mx-auto max-w-7xl px-5 py-24 sm:px-8"><div className="mb-12 flex items-end justify-between gap-5"><div><span className="text-xs uppercase tracking-[.28em] text-zinc-500">Workflow</span><h2 className="mt-4 text-3xl font-medium sm:text-5xl">Three steps. Client-ready.</h2></div></div><div className="grid gap-4 md:grid-cols-3">{items.map(([n,t,d])=><div key={n} className="rounded-2xl border border-white/[.08] p-6"><div className="flex items-center justify-between"><span className="text-sm text-zinc-600">{n}</span><ArrowRight className="h-4 w-4 text-zinc-600" /></div><h3 className="mt-20 text-xl">{t}</h3><p className="mt-2 text-sm text-zinc-500">{d}</p></div>)}</div></div></section> }

const plans=[
  {n:'Free',p:'₹0',sub:'3 reports / month',items:['Basic audit','Shareable result','Scoryn branding'],cta:'Start free'},
  {n:'Pro',p:'₹499',sub:'per month',items:['50 reports / month','Custom branding','PDF download','Client management'],cta:'Choose Pro',hot:true},
  {n:'Agency',p:'₹999',sub:'per month',items:['Fair-use unlimited audits','Custom branding','5 team members','Priority processing'],cta:'Choose Agency'}
];
export function PricingSection(){return <section id="pricing" className="mx-auto max-w-7xl px-5 py-24 sm:px-8"><div className="mx-auto mb-12 max-w-2xl text-center"><span className="text-xs uppercase tracking-[.28em] text-rose">Pricing</span><h2 className="mt-4 text-3xl font-medium sm:text-5xl">Start free. Upgrade when clients grow.</h2></div><div className="grid gap-4 lg:grid-cols-3">{plans.map(p=><div key={p.n} className={`rounded-3xl border p-7 ${p.hot?'border-magenta/50 bg-magenta/[.07]':'border-white/[.08] bg-[#0b0b0b]'}`}><div className="flex items-center justify-between"><h3 className="text-xl">{p.n}</h3>{p.hot&&<span className="rounded-full bg-magenta px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">Popular</span>}</div><div className="mt-8 text-4xl font-medium">{p.p}</div><p className="mt-1 text-sm text-zinc-500">{p.sub}</p><div className="my-8 h-px bg-white/[.07]"/><div className="space-y-3">{p.items.map(i=><div key={i} className="flex items-center gap-2 text-sm text-zinc-300"><CheckCircle2 className="h-4 w-4 text-rose" />{i}</div>)}</div><Button asChild variant={p.hot?'accent':'outline'} className="mt-9 w-full"><Link href="/signup">{p.cta}</Link></Button></div>)}</div></section>}

export function Footer(){return <footer className="border-t border-white/[.06]"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div className="flex items-center gap-2 text-zinc-300"><FileText className="h-4 w-4"/>Scoryn</div><p>Branded website audits for freelancers and agencies.</p><div className="flex gap-5"><Link href="/login">Login</Link><Link href="/signup">Signup</Link><span className="inline-flex items-center gap-1"><Link2 className="h-3 w-3"/>Socials</span></div></div></footer>}
