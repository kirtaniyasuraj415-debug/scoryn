import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScanSearch } from 'lucide-react';
export function Navbar() { return <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
  <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black"><ScanSearch className="h-4 w-4" /></span>Scoryn</Link>
  <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex"><a href="#features" className="hover:text-white">Features</a><a href="#how" className="hover:text-white">How it works</a><a href="#pricing" className="hover:text-white">Pricing</a></div>
  <div className="flex items-center gap-2"><Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button><Button asChild size="sm"><Link href="/signup">Start free</Link></Button></div>
</nav> }
