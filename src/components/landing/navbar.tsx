import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScorynMark } from '@/components/brand/scoryn-mark';

export function Navbar() {
  return <nav className="relative z-30 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
    <Link href="/" className="flex items-center gap-2.5 font-heading text-sm font-bold tracking-tight sm:text-base">
      <ScorynMark size={32}/>
      Scoryn
    </Link>

    <div className="hidden items-center gap-8 text-xs text-zinc-500 md:flex">
      <a href="#features" className="transition hover:text-rose">Features</a>
      <a href="#how" className="transition hover:text-rose">How it works</a>
      <a href="#pricing" className="transition hover:text-rose">Pricing</a>
    </div>

    <div className="flex items-center gap-1.5 sm:gap-2">
      <Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button>
      <Button asChild size="sm"><Link href="/signup">Start free</Link></Button>
    </div>
  </nav>;
}
