import { AuditBox } from '@/components/landing/audit-box';
import { HeroShowcase } from '@/components/landing/hero-showcase';
import { Navbar } from '@/components/landing/navbar';
import {
  AuditCategoriesSection,
  FAQSection,
  FeatureSection,
  FinalCTASection,
  Footer,
  PricingSection,
  ReliabilitySection,
  ReportPreviewSection,
  UseCasesSection,
  WorkflowBentoSection
} from '@/components/landing/sections';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return <main className="min-h-screen overflow-x-hidden bg-black text-white">
    <section className="relative overflow-hidden bg-black">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="noise pointer-events-none absolute inset-0 opacity-[.14]" />
      <div className="hero-ambient-glow pointer-events-none absolute left-1/2 top-[410px] h-[520px] w-[880px] -translate-x-1/2 rounded-full" />

      <Navbar />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-14 pt-14 text-center sm:px-8 sm:pt-20 lg:pt-24">
        <div className="hero-eyebrow-line mb-6 flex items-center gap-3 sm:mb-7">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/25 sm:w-16" />
          <Badge className="border-white/[.08] bg-black/40 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[.18em] text-zinc-450 sm:text-[10px]">
            Simplify your client audit workflow
          </Badge>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/25 sm:w-16" />
        </div>

        <h1 className="font-heading max-w-[860px] text-balance text-[2.2rem] font-bold leading-[.99] tracking-[-.05em] sm:text-[3.5rem] md:text-[4.2rem] lg:text-[4.7rem]">
          Client websites ka audit <span className="hero-accent-text">30 seconds</span> mein, tumhare branding ke saath.
        </h1>

        <p className="mt-5 max-w-[620px] text-balance text-[13px] leading-6 text-zinc-500 sm:mt-6 sm:text-[15px] sm:leading-7">
          PageSpeed data ko clear business language mein convert karo, branded report banao, aur client ko ek professional sales-ready deliverable bhejo.
        </p>

        <div className="mt-8 w-full sm:mt-9">
          <AuditBox />
          <p className="mt-3 text-[10px] text-zinc-700 sm:text-xs">Demo audit login ke bina • PDF account ke baad unlock hota hai</p>
        </div>

        <HeroShowcase />
      </div>
    </section>

    <AuditCategoriesSection />
    <WorkflowBentoSection />
    <FeatureSection />
    <ReportPreviewSection />
    <UseCasesSection />
    <ReliabilitySection />
    <PricingSection />
    <FAQSection />
    <FinalCTASection />
    <Footer />
  </main>;
}
