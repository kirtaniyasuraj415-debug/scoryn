import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { getServerUser } from '@/lib/auth/session';
import { ScanSearch } from 'lucide-react';

export default async function Login(){
  const user=await getServerUser();
  if(user) redirect('/dashboard');

  return <main className="grid min-h-screen place-items-center bg-[#070707] px-4">
    <div className="w-full max-w-md rounded-3xl border border-white/[.08] bg-[#0d0d0d] p-7 sm:p-9">
      <Link href="/" className="mb-10 flex items-center gap-2 font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black"><ScanSearch className="h-4 w-4"/></span>
        Scoryn
      </Link>
      <h1 className="text-3xl font-medium">Welcome back</h1>
      <p className="mt-2 text-sm text-zinc-500">Your audits, clients and reports are waiting.</p>
      <div className="mt-8"><AuthForm mode="login"/></div>
      <p className="mt-6 text-center text-sm text-zinc-500">No account? <Link className="text-white" href="/signup">Start free</Link></p>
    </div>
  </main>;
}
