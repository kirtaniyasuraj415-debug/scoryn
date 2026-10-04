import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Gauge,
  Globe2,
  Link2,
  LockKeyhole,
  MessageCircle,
  Monitor,
  Palette,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-5 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[.24em] text-zinc-500 sm:text-xs">
    <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
    <span className="rounded-full border border-white/[.07] bg-white/[.018] px-3 py-1.5">{children}</span>
    <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
  </div>;
}

function AuditDashboardMock() {
  const bars = [34, 46, 54, 63, 72, 82, 66, 88, 76, 91, 84, 94];
  return <div className="mock-panel rounded-[20px] p-4 sm:p-5">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="font-heading text-sm font-bold text-zinc-100">acmeinteriors.com</p>
        <p className="mt-1 text-[10px] text-zinc-600">Latest audit • Mobile + Desktop</p>
      </div>
      <span className="rounded-full border border-magenta/20 bg-magenta/[.07] px-2.5 py-1 text-[9px] text-rose">Ready</span>
    </div>

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        ['Performance', '78'],
        ['SEO', '94'],
        ['Accessibility', '88'],
        ['Best Practices', '91']
      ].map(([label, score]) => <div key={label} className="rounded-xl border border-white/[.055] bg-black/35 p-3">
        <div className="font-heading text-xl font-bold">{score}</div>
        <div className="mt-1 text-[9px] text-zinc-600">{label}</div>
      </div>)}
    </div>

    <div className="mt-3 grid gap-3 sm:grid-cols-[1.1fr_.9fr]">
      <div className="rounded-xl border border-white/[.055] bg-black/35 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">Performance trend</span>
          <span className="text-[9px] text-rose">+12</span>
        </div>
        <div className="mt-5 flex h-20 items-end gap-1.5">
          {bars.map((h, i) => <span key={i} className="hero-chart-bar w-full rounded-t-sm" style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }} />)}
        </div>
      </div>

      <div className="rounded-xl border border-white/[.055] bg-black/35 p-4">
        <div className="text-[10px] text-zinc-500">Priority issues</div>
        <div className="mt-4 space-y-2">
          {['Largest content paint', 'Heavy images', 'Missing meta copy'].map((x, i) => <div key={x} className="flex items-center justify-between rounded-lg border border-white/[.04] bg-white/[.018] px-3 py-2">
            <span className="text-[9px] text-zinc-400">{x}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-rose' : 'bg-magenta/70'}`} />
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}

function AIExplanationMock() {
  return <div className="mock-panel mock-panel-right rounded-[20px] p-4">
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-full border border-magenta/20 bg-magenta/[.08] text-rose"><Bot className="h-4 w-4" /></div>
      <div>
        <div className="font-heading text-xs font-bold">AI business explanation</div>
        <div className="text-[9px] text-zinc-600">Hinglish / English</div>
      </div>
    </div>
    <div className="mt-5 rounded-xl border border-white/[.055] bg-black/35 p-4">
      <p className="text-[10px] leading-5 text-zinc-400">“Hero image heavy hai, isliye mobile users ko first content late dikhta hai. Compress karke faster first impression mil sakta hai.”</p>
    </div>
    <div className="mt-3 rounded-xl border border-magenta/15 bg-magenta/[.055] p-3">
      <p className="text-[9px] uppercase tracking-wider text-rose/75">Business impact</p>
      <p className="mt-1 text-[10px] leading-5 text-zinc-300">Slow first view enquiry se pehle unnecessary friction create kar sakta hai.</p>
    </div>
  </div>;
}

function BrandReportMock() {
  return <div className="mock-panel rounded-[20px] p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg border border-magenta/25 bg-gradient-to-br from-[#741041] to-[#c51d6f] text-[10px] font-black text-white shadow-[0_0_24px_rgba(197,29,111,.2)]">A</div>
        <span className="font-heading text-xs font-bold">Aster Studio</span>
      </div>
      <span className="text-[8px] uppercase tracking-[.2em] text-zinc-600">Audit Report</span>
    </div>
    <div className="mt-6 flex items-end justify-between gap-3">
      <div>
        <div className="font-heading text-3xl font-bold">84</div>
        <div className="text-[9px] text-zinc-600">Overall website score</div>
      </div>
      <div className="h-9 w-24 rounded-full bg-gradient-to-r from-magenta/20 via-rose/45 to-magenta/10 shadow-[0_0_28px_rgba(197,29,111,.18)]" />
    </div>
    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[.05]"><div className="score-bar h-full w-[84%] rounded-full" /></div>
    <div className="mt-5 rounded-xl border border-magenta/20 bg-magenta/[.06] p-3">
      <div className="font-heading text-[11px] font-bold text-zinc-100">Want these issues fixed?</div>
      <div className="mt-1 text-[9px] text-zinc-500">WhatsApp • Email • Phone</div>
    </div>
  </div>;
}

function ShareMock() {
  return <div className="mock-panel rounded-[20px] p-4 sm:p-5">
    <div className="mb-4 flex items-center justify-between">
      <span className="font-heading text-xs font-bold">Send to client</span>
      <Share2 className="h-4 w-4 text-rose" />
    </div>
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-xl border border-white/[.055] bg-black/35 p-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg border border-magenta/15 bg-magenta/[.06] text-rose"><MessageCircle className="h-4 w-4" /></div>
        <div><p className="text-[10px] text-zinc-200">WhatsApp share</p><p className="text-[9px] text-zinc-600">Public report link ready</p></div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-white/[.055] bg-black/35 p-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg border border-magenta/15 bg-magenta/[.06] text-rose"><Download className="h-4 w-4" /></div>
        <div><p className="text-[10px] text-zinc-200">Branded PDF</p><p className="text-[9px] text-zinc-600">Download once, send anywhere</p></div>
      </div>
    </div>
    <button className="glow-action mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold text-white shadow-[0_0_35px_rgba(197,29,111,.2)]">
      Send report <ArrowRight className="h-3.5 w-3.5" />
    </button>
  </div>;
}

export function AuditCategoriesSection() {
  const categories = [
    [Gauge, 'Performance', 'Load speed, Core Web Vitals, heavy assets'],
    [Search, 'SEO', 'Metadata, crawlability, search-readiness'],
    [Eye, 'Accessibility', 'Readable, usable and inclusive experience'],
    [ShieldCheck, 'Best Practices', 'Browser quality, safety and modern standards']
  ] as const;

  return <section className="border-y border-white/[.05] bg-[#060606]">
    <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(([Icon, title, desc]) => <div key={title} className="group flex items-start gap-3 rounded-2xl border border-white/[.055] bg-white/[.012] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-magenta/20 hover:bg-magenta/[.025]">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-magenta/15 bg-magenta/[.045] text-rose"><Icon className="h-4 w-4" /></div>
          <div><h3 className="font-heading text-[13px] font-bold">{title}</h3><p className="mt-1 text-[11px] leading-5 text-zinc-600">{desc}</p></div>
        </div>)}
      </div>
    </div>
  </section>;
}

export function WorkflowBentoSection() {
  return <section id="how" className="relative overflow-hidden bg-black">
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-magenta/[.045] blur-[130px]" />

    <div className="relative mx-auto max-w-[980px] px-5 py-24 sm:px-8 lg:py-32">
      <SectionLabel>Our workflow</SectionLabel>
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-heading text-balance text-3xl font-bold tracking-[-.045em] sm:text-5xl">How Scoryn makes your client audit workflow easier</h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500">Four steps. Same dark bento proportions as the reference, with Scoryn’s magenta depth and real product workflow.</p>
      </div>

      <div className="mt-14 grid gap-3 lg:grid-cols-12">
        <article className="reference-card bento-card-large rounded-[26px] p-5 lg:col-span-7">
          <div className="flex h-full flex-col">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-[.23em] text-rose/65">Step 01</span>
                <h3 className="mt-2 font-heading text-xl font-bold">Audit the website</h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">PageSpeed ke mobile + desktop signals ko merge karke priority issues ek clear dashboard mein milte hain.</p>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-magenta/15 bg-magenta/[.05] text-rose"><Gauge className="h-4 w-4" /></div>
            </div>
            <div className="mt-auto"><AuditDashboardMock /></div>
          </div>
        </article>

        <article className="reference-card bento-card-large rounded-[26px] p-5 lg:col-span-5">
          <div className="flex h-full flex-col">
            <div className="mb-6">
              <span className="text-[9px] uppercase tracking-[.23em] text-rose/65">Step 02</span>
              <h3 className="mt-2 font-heading text-xl font-bold">Explain it simply</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Technical issue ko client-friendly language aur realistic business impact mein convert karo.</p>
            </div>
            <div className="mt-auto"><AIExplanationMock /></div>
          </div>
        </article>

        <article className="reference-card bento-card-small rounded-[26px] p-5 lg:col-span-4">
          <div className="flex h-full flex-col">
            <div className="mb-6">
              <span className="text-[9px] uppercase tracking-[.23em] text-rose/65">Step 03</span>
              <h3 className="mt-2 font-heading text-xl font-bold">Apply your brand</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Agency name, logo, color aur CTA ko report mein lock karo.</p>
            </div>
            <div className="mt-auto"><BrandReportMock /></div>
          </div>
        </article>

        <article className="reference-card bento-card-small rounded-[26px] p-5 lg:col-span-8">
          <div className="flex h-full flex-col">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-[.23em] text-rose/65">Step 04</span>
                <h3 className="mt-2 font-heading text-xl font-bold">Send the report</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">Branded PDF ya public link WhatsApp par bhejo. Client ko login ki zarurat nahi.</p>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-magenta/15 bg-magenta/[.05] text-rose"><Share2 className="h-4 w-4" /></div>
            </div>
            <div className="mt-auto"><ShareMock /></div>
          </div>
        </article>
      </div>
    </div>
  </section>;
}

export function FeatureSection() {
  const features = [
    [Globe2, 'Mobile + desktop audit', 'Dono strategies ka data merge hota hai, isliye report ek single-device snapshot par depend nahi karta.'],
    [Bot, 'AI explanation + fallback', 'NVIDIA explanation fail ho to pre-written fallback copy use hoti hai, report flow rukta nahi.'],
    [Palette, 'White-label branding', 'Agency logo, color, signature aur contact CTA har client report mein apply karo.'],
    [Share2, 'PDF + public sharing', 'Branded PDF download karo ya login-free report link WhatsApp par send karo.']
  ] as const;

  return <section id="features" className="relative border-y border-white/[.05] bg-[#070707]">
    <div className="mx-auto max-w-[980px] px-5 py-24 sm:px-8 lg:py-32">
      <SectionLabel>Key features</SectionLabel>
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-heading text-balance text-3xl font-bold tracking-[-.045em] sm:text-5xl">The four things that make Scoryn useful in real client work</h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500">No oversized feature wall. Sirf woh capabilities highlight ki gayi hain jo audit ko actual client deliverable banati hain.</p>
      </div>

      <div className="mt-14 grid gap-3 md:grid-cols-2">
        {features.map(([Icon,title,desc], index) => <article key={title} className="reference-card feature-highlight-card rounded-[26px] p-6">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-magenta/15 bg-magenta/[.05] text-rose"><Icon className="h-5 w-5" /></div>
            <span className="text-[9px] tracking-[.18em] text-zinc-700">0{index + 1}</span>
          </div>
          <div className="mt-14 max-w-md">
            <h3 className="font-heading text-xl font-bold">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-500">{desc}</p>
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}

export function ReportPreviewSection() {
  return <section className="relative overflow-hidden bg-black">
    <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <SectionLabel>Sales-ready output</SectionLabel>
          <h2 className="font-heading text-balance text-3xl font-bold tracking-[-.04em] sm:text-5xl">A report that looks like your agency made it from scratch</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">Client ko score ke saath context milta hai: issue kya hai, business par kya effect ho sakta hai aur next action kya hona chahiye.</p>
          <div className="mt-8 space-y-3">
            {[
              'Overall + 4 category scores',
              'Priority issues with severity',
              'Simple AI explanation',
              'Business impact without invented statistics',
              'Agency-branded CTA and contact details'
            ].map(x => <div key={x} className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-4 w-4 text-rose" />{x}</div>)}
          </div>
          <Button asChild variant="accent" className="mt-9"><a href="/signup">Create your first report <ArrowRight className="h-4 w-4" /></a></Button>
        </div>

        <div className="reference-card card-grid rounded-[30px] p-4 sm:p-8">
          <div className="mock-panel mx-auto max-w-2xl rounded-[24px] p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-heading text-sm font-bold">Northline Studio</div>
                <div className="text-[10px] text-zinc-600">Website Audit Report</div>
              </div>
              <div className="rounded-full border border-magenta/15 bg-magenta/[.045] px-3 py-1 text-[9px] text-rose/80">Prepared by your agency</div>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-[150px_1fr]">
              <div className="grid place-items-center rounded-2xl border border-white/[.055] bg-black/35 p-5">
                <div className="relative grid h-24 w-24 place-items-center rounded-full border-[7px] border-magenta/70 shadow-[0_0_50px_rgba(197,29,111,.14)]">
                  <div className="text-center"><div className="font-heading text-3xl font-bold">84</div><div className="text-[8px] text-zinc-600">OVERALL</div></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[['Performance','78'],['SEO','94'],['Accessibility','88'],['Best Practices','91']].map(([l,v]) => <div key={l} className="rounded-xl border border-white/[.055] bg-black/35 p-3"><div className="font-heading text-xl font-bold">{v}</div><div className="mt-1 text-[9px] text-zinc-600">{l}</div></div>)}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                ['High','Largest content appears too late','The main visual is delaying the first useful impression for mobile visitors.'],
                ['Medium','Images can be lighter','Modern image formats can reduce page weight without visible quality loss.'],
                ['Medium','Search snippet needs clarity','Metadata can explain the business offer more clearly before the click.']
              ].map(([sev,title,copy]) => <div key={title} className="rounded-xl border border-white/[.055] bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3"><div className="font-heading text-[11px] font-bold">{title}</div><span className="text-[8px] uppercase tracking-wider text-rose">{sev}</span></div>
                <p className="mt-2 text-[9px] leading-4 text-zinc-500">{copy}</p>
              </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

export function UseCasesSection() {
  const cards = [
    ['01', 'Cold outreach', 'Prospect ki existing website ko audit karke generic DM ki jagah real proof aur clear next step bhejo.'],
    ['02', 'Redesign pitch', 'Scores, priority issues aur business impact ke saath redesign conversation ko stronger banao.'],
    ['03', 'Existing clients', 'Monthly ya quarterly website health report ko premium branded deliverable mein convert karo.']
  ] as const;

  return <section className="numbers-reference-section border-y border-white/[.045] bg-[#050505]">
    <div className="mx-auto max-w-[980px] px-5 py-24 sm:px-8 lg:py-32">
      <SectionLabel>Made for service businesses</SectionLabel>
      <div className="mx-auto max-w-[760px] text-center">
        <h2 className="font-heading text-balance text-3xl font-bold tracking-[-.045em] sm:text-5xl">Use Scoryn before the sale, during the pitch and after the project</h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500">Same compact number-card language as the reference: dark glass, soft burgundy depth, edge light, subtle 3D tilt and animated glow.</p>
      </div>

      <div className="numbers-reference-grid mt-12 grid gap-3 md:grid-cols-3">
        {cards.map(([number,title,desc], index) => <article
          key={title}
          className="numbers-reference-card group"
          style={{ animationDelay: `${index * 650}ms` }}
        >
          <div className="numbers-card-shine" />
          <div className="numbers-card-noise" />
          <div className="numbers-card-content">
            <div className="flex items-start justify-between gap-4">
              <span className="numbers-card-value">{number}</span>
              <span className="numbers-card-dot" />
            </div>
            <div className="mt-12 sm:mt-14">
              <h3 className="font-heading text-[15px] font-bold tracking-[-.02em] text-zinc-100 sm:text-base">{title}</h3>
              <p className="mt-3 text-[12px] leading-6 text-zinc-500">{desc}</p>
            </div>
          </div>
          <div className="numbers-card-underlight" />
        </article>)}
      </div>
    </div>
  </section>;
}

export function ReliabilitySection() {
  const items = [
    [LockKeyhole, 'Private API keys', 'Keys server-side only.'],
    [Sparkles, 'AI fallback', 'AI fail ho to template explanation.'],
    [FileText, 'Saved report data', 'Same audit ko baar-baar rerun nahi karna.'],
    [Share2, 'Public client view', 'Simple share route without client login.']
  ] as const;

  return <section className="bg-black">
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="reference-card rounded-[28px] p-5 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <span className="text-xs uppercase tracking-[.24em] text-rose/70">Reliable by design</span>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-[-.04em]">A report flow that does not collapse when one API has a bad day.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map(([Icon,title,desc]) => <div key={title} className="rounded-2xl border border-white/[.055] bg-black/35 p-4"><div className="flex items-start gap-3"><Icon className="mt-0.5 h-4 w-4 text-rose" /><div><div className="font-heading text-sm font-bold">{title}</div><div className="mt-1 text-xs leading-5 text-zinc-600">{desc}</div></div></div></div>)}
          </div>
        </div>
      </div>
    </div>
  </section>;
}

const plans = [
  {n:'Free',p:'₹0',sub:'3 reports / month',items:['Basic audit','Shareable result','Scoryn branding'],cta:'Start free'},
  {n:'Pro',p:'₹499',sub:'per month',items:['50 reports / month','Custom branding','PDF download','Client management'],cta:'Choose Pro',hot:true},
  {n:'Agency',p:'₹999',sub:'per month',items:['Fair-use unlimited audits','Custom branding','5 team members','Priority processing'],cta:'Choose Agency'}
];

export function PricingSection() {
  return <section id="pricing" className="border-t border-white/[.05] bg-[#070707]">
    <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionLabel>Pricing</SectionLabel>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-3xl font-bold tracking-[-.04em] sm:text-5xl">Start free. Upgrade only when client volume grows.</h2>
        <p className="mt-5 text-sm leading-7 text-zinc-500 sm:text-base">Free plan se actual workflow test karo. Payment layer Razorpay test mode ke liye prepared hai.</p>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {plans.map(p => <div key={p.n} className={`reference-card rounded-[26px] p-7 ${p.hot ? 'ring-1 ring-magenta/35' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold">{p.n}</h3>
            {p.hot && <span className="rounded-full border border-magenta/30 bg-magenta/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose">Popular</span>}
          </div>
          <div className="mt-9 font-heading text-4xl font-bold">{p.p}</div>
          <p className="mt-1 text-sm text-zinc-500">{p.sub}</p>
          <div className="my-8 glow-divider" />
          <div className="space-y-3">{p.items.map(i => <div key={i} className="flex items-center gap-2 text-sm text-zinc-300"><CheckCircle2 className="h-4 w-4 text-rose" />{i}</div>)}</div>
          <Button asChild variant={p.hot ? 'accent' : 'outline'} className="mt-9 w-full"><a href="/signup">{p.cta}</a></Button>
        </div>)}
      </div>
    </div>
  </section>;
}

export function FAQSection() {
  const faqs = [
    ['Audit ka data kahan se aata hai?', 'Google PageSpeed Insights ke mobile + desktop runs se performance, SEO, accessibility aur best-practice signals aate hain.'],
    ['AI galat percentage invent karega?', 'Nahi. Scoryn prompt unsupported percentages aur revenue-loss claims ko explicitly block karta hai.'],
    ['NVIDIA API fail ho gayi to?', 'Common issues ke liye fallback explanations use hongi, isliye report generation pura crash nahi hona chahiye.'],
    ['Client ko account banana padega?', 'Public report link ke liye nahi. Client bina login report dekh sakta hai.'],
    ['Kya apna logo aur colour use kar sakte hain?', 'Pro aur Agency workflow custom branding ke liye designed hai.']
  ];

  return <section className="bg-black">
    <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
      <SectionLabel>FAQ</SectionLabel>
      <h2 className="text-center font-heading text-3xl font-bold tracking-[-.04em] sm:text-5xl">Questions before you run the first report</h2>
      <div className="mt-12 space-y-3">
        {faqs.map(([q,a]) => <details key={q} className="group rounded-2xl border border-white/[.06] bg-[#0b0b0b] p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-heading text-sm font-bold sm:text-base">{q}<span className="text-xl font-light text-zinc-600 transition group-open:rotate-45">+</span></summary>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">{a}</p>
        </details>)}
      </div>
    </div>
  </section>;
}

export function FinalCTASection() {
  return <section className="bg-black px-5 pb-24 sm:px-8">
    <div className="reference-card relative mx-auto max-w-6xl overflow-hidden rounded-[30px] px-6 py-16 text-center sm:px-10 sm:py-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-magenta/20 blur-[90px]" />
      <div className="relative">
        <span className="text-xs uppercase tracking-[.24em] text-rose/75">Ready when you are</span>
        <h2 className="mx-auto mt-5 max-w-4xl font-heading text-balance text-3xl font-bold tracking-[-.045em] sm:text-5xl lg:text-6xl">Paste a client URL. Leave with a report you can actually sell from.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">Start with 3 free reports and see whether Scoryn fits your outreach workflow.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="accent" size="lg"><a href="/signup">Start free <ArrowRight className="h-4 w-4" /></a></Button>
          <Button asChild variant="outline" size="lg"><Link href="/#pricing">View pricing</Link></Button>
        </div>
      </div>
    </div>
  </section>;
}

export function Footer() {
  return <footer className="border-t border-white/[.05] bg-[#050505]">
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm sm:px-8 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div>
        <div className="flex items-center gap-2 font-heading font-bold text-zinc-200"><FileText className="h-4 w-4 text-rose" />Scoryn</div>
        <p className="mt-2 max-w-md text-xs leading-5 text-zinc-600">Branded website audits for freelancers and agencies.</p>
      </div>
      <div className="flex flex-wrap gap-5 text-zinc-500"><a href="#features">Features</a><a href="#how">Workflow</a><a href="#pricing">Pricing</a></div>
      <div className="flex flex-wrap gap-5 text-zinc-600"><a href="/login">Login</a><a href="/signup">Signup</a><span className="inline-flex items-center gap-1"><Link2 className="h-3 w-3" />Socials</span></div>
    </div>
  </footer>;
}
