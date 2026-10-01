import {
  Activity,
  BarChart3,
  Bot,
  FileText,
  Gauge,
  Globe2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

const trustItems = [
  [Gauge, 'PageSpeed'],
  [Bot, 'NVIDIA AI'],
  [ShieldCheck, 'Firebase'],
  [FileText, 'Branded PDF'],
  [MessageCircle, 'WhatsApp'],
  [Globe2, 'Public Reports']
] as const;

export function HeroShowcase() {
  return <div className="mt-14 w-full">
    <div className="hero-product-wrap mx-auto max-w-[920px]">
      <div className="hero-side-glow hero-side-glow-left" />
      <div className="hero-side-glow hero-side-glow-right" />

      <div className="hero-product-panel">
        <div className="hero-product-topbar">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-magenta shadow-[0_0_18px_rgba(197,29,111,.9)]" />
            <span className="font-heading text-[11px] font-bold text-zinc-300">Scoryn Audit Workspace</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-zinc-600">
            <Activity className="h-3.5 w-3.5 text-rose/80" />
            Live audit preview
          </div>
        </div>

        <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[18px] border border-white/[.065] bg-black/45 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-sm font-bold">clientwebsite.com</p>
                <p className="mt-1 text-[10px] text-zinc-600">Mobile + desktop merged result</p>
              </div>
              <span className="rounded-full border border-magenta/20 bg-magenta/[.08] px-2.5 py-1 text-[9px] text-rose">Ready</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['78', 'Performance'],
                ['94', 'SEO'],
                ['88', 'Accessibility'],
                ['91', 'Best Practices']
              ].map(([score, label]) => <div key={label} className="rounded-xl border border-white/[.055] bg-white/[.018] p-3">
                <div className="font-heading text-xl font-bold text-zinc-100">{score}</div>
                <div className="mt-1 text-[8px] leading-4 text-zinc-600">{label}</div>
              </div>)}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-xl border border-white/[.055] bg-white/[.015] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-zinc-600">Performance trend</span>
                  <span className="text-[9px] text-rose">+12 pts</span>
                </div>
                <div className="mt-5 flex h-[74px] items-end gap-1.5">
                  {[31,45,39,62,57,74,68,86,77,91,83,95].map((h, i) =>
                    <span key={i} className="hero-chart-bar w-full rounded-t-sm" style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }} />
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/[.055] bg-white/[.015] p-4">
                <div className="text-[9px] text-zinc-600">Priority issues</div>
                <div className="mt-4 space-y-2">
                  {['Slow hero render', 'Heavy images', 'Weak search snippet'].map((item, i) => <div key={item} className="flex items-center justify-between rounded-lg border border-white/[.04] bg-black/30 px-3 py-2">
                    <span className="text-[8px] text-zinc-500">{item}</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-rose' : 'bg-magenta/70'}`} />
                  </div>)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[18px] border border-white/[.065] bg-black/45 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full border border-magenta/20 bg-magenta/[.08] text-rose">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-xs font-bold">AI explanation</p>
                  <p className="mt-1 text-[9px] text-zinc-600">Business-friendly copy</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-white/[.055] bg-white/[.015] p-4">
                <p className="text-[9px] leading-5 text-zinc-400">“The main visual appears later than ideal on mobile. Improving it can make the website feel faster before a visitor reaches the offer.”</p>
              </div>
            </div>

            <div className="rounded-[18px] border border-white/[.065] bg-black/45 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading text-xs font-bold">Branded report</p>
                  <p className="mt-1 text-[9px] text-zinc-600">Agency identity + CTA</p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full border border-magenta/20 bg-magenta/[.08] text-rose">
                  <Zap className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[.04]"><div className="score-bar h-full w-[84%] rounded-full" /></div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-magenta/15 bg-magenta/[.045] p-3">
                <div>
                  <p className="font-heading text-[10px] font-bold text-zinc-200">Ready to send</p>
                  <p className="mt-1 text-[8px] text-zinc-600">PDF + public link</p>
                </div>
                <BarChart3 className="h-4 w-4 text-rose" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="trust-marquee mt-6 border-y border-white/[.055] bg-black/70 py-3">
      <div className="trust-track">
        {[...trustItems, ...trustItems].map(([Icon, label], i) => <div key={`${label}-${i}`} className="trust-pill">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-magenta/20 bg-magenta/[.06] text-rose"><Icon className="h-3.5 w-3.5" /></span>
          <span>{label}</span>
        </div>)}
      </div>
    </div>
  </div>;
}
