import Link from 'next/link';

export function BetaBanner(){
  return <div className="relative z-[120] border-b border-[#c51d6f]/20 bg-[#090708] px-4 py-2 text-center text-[10px] leading-5 text-zinc-500">
    <span className="mr-2 inline-flex rounded-full border border-[#c51d6f]/30 bg-[#c51d6f]/[.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[.16em] text-[#f0a4cf]">Beta</span>
    Scoryn is in active beta. Some features may change while we improve reliability.
    <Link href="/feedback" className="ml-2 text-[#f0a4cf] underline decoration-[#c51d6f]/40 underline-offset-2 transition hover:text-white">Send feedback</Link>
  </div>;
}
