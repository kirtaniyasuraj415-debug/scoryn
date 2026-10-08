import Link from 'next/link';

export function BetaBanner(){
  return <div className="border-b border-white/[.06] bg-white/[.02] px-4 py-2 text-center text-[11px] leading-5 text-zinc-500">
    <span className="mr-2 inline-flex rounded-full border border-amber-400/20 bg-amber-400/[.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[.16em] text-amber-300">Beta</span>
    Scoryn is in active beta. Some features may change while we improve reliability.
    <Link href="/feedback" className="ml-1 text-zinc-300 underline underline-offset-2">Send feedback</Link>
  </div>;
}
