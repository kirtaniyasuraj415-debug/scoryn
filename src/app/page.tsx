import { AuditBox } from '@/components/landing/audit-box';
import { Navbar } from '@/components/landing/navbar';
import { FeatureSection, Footer, HowSection, PricingSection } from '@/components/landing/sections';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, BarChart3, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  return <main className="min-h-screen bg-canvas text-black">
    <section className="px-3 pb-3 pt-3 sm:px-5 sm:pt-5">
      <div className="relative min-h-[780px] overflow-hidden rounded-[30px] bg-black text-white sm:min-h-[860px]">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="noise pointer-events-none absolute inset-0 opacity-25" />
        <div className="pointer-events-none absolute left-1/2 top-[53%] h-[430px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full gradient-orb opacity-45 blur-2xl" />
        <Navbar />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 pb-20 pt-20 text-center sm:pt-28">
          <Badge className="mb-7 border-white/15 bg-black/30 text-zinc-300">Website audit → AI explanation → branded report</Badge>
          <h1 className="max-w-5xl text-balance text-[clamp(2.7rem,7vw,6.7rem)] font-medium leading-[.95] tracking-[-.055em]">Client websites ka audit <span className="text-rose">30 seconds</span> mein, tumhare branding ke saath.</h1>
          <p className="mt-7 max-w-2xl text-balance text-sm leading-6 text-zinc-400 sm:text-base">Freelancers aur web developers ke liye sales-ready website reports. Technical data ko clear business impact mein convert karo.</p>
          <div className="mt-12 w-full"><AuditBox /><p className="mt-4 text-xs text-zinc-600">Demo audit login ke bina • PDF account ke baad unlock hota hai</p></div>
          <div className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-3 text-left"><div className="rounded-2xl border border-white/[.07] bg-black/40 p-4"><BarChart3 className="mb-8 h-4 w-4 text-rose"/><p className="text-xs text-zinc-500">4 audit categories</p></div><div className="rounded-2xl border border-white/[.07] bg-black/40 p-4"><ShieldCheck className="mb-8 h-4 w-4 text-rose"/><p className="text-xs text-zinc-500">Server-side API keys</p></div><div className="rounded-2xl border border-white/[.07] bg-black/40 p-4"><FileText className="mb-8 h-4 w-4 text-rose"/><p className="text-xs text-zinc-500">Client-ready PDF</p></div></div>
          <ArrowDown className="mt-14 h-4 w-4 text-zinc-700" />
        </div>
      </div>
    </section>
    <div className="bg-black text-white"><FeatureSection/><HowSection/><PricingSection/><Footer/></div>
  </main>;
}
