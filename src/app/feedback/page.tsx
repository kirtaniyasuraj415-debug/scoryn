import Link from 'next/link';

export default function FeedbackPage(){
  return <main className="min-h-screen bg-black px-5 py-16 text-white sm:px-8">
    <div className="mx-auto max-w-xl">
      <Link href="/" className="text-xs text-zinc-500 hover:text-white">← Back to Scoryn</Link>
      <p className="mt-10 text-[10px] uppercase tracking-[.24em] text-amber-300/80">Beta feedback</p>
      <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight">Help us improve Scoryn.</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-500">Scoryn is actively being tested. If an audit, report, PDF, login flow, or another feature behaves unexpectedly, tell us what happened.</p>
      <div className="mt-8 rounded-[24px] border border-white/[.07] bg-white/[.02] p-6">
        <p className="text-sm text-zinc-300">Include the page you were using, what you expected, what happened instead, and the audit URL if relevant.</p>
        <a href="mailto:hello@scoryn.app?subject=Scoryn%20Beta%20Feedback" className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-black">Email beta feedback</a>
        <p className="mt-3 text-[11px] text-zinc-700">Do not include passwords, API keys, payment credentials, or other secrets.</p>
      </div>
    </div>
  </main>;
}
