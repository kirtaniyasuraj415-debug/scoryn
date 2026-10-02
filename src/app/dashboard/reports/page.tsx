import { FileText, Search, Share2 } from 'lucide-react';

export default function ReportsPage(){
  return <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-6xl px-4 py-10 pb-20 sm:px-8 lg:py-14">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[.24em] text-rose/70">Reports</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-[-.035em] sm:text-4xl">Client-ready reports</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600">Completed audits, branded PDFs and public share links will stay organized here.</p>
      </div>
      <div className="flex h-10 w-full max-w-xs items-center gap-2 rounded-xl border border-white/[.055] bg-white/[.018] px-3 text-xs text-zinc-700 sm:w-[260px]">
        <Search className="h-3.5 w-3.5"/><span>Search reports…</span>
      </div>
    </div>

    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      {[
        [FileText,'Completed reports','0'],
        [Share2,'Shared with clients','0'],
        [FileText,'PDF downloads','0']
      ].map(([Icon,label,value])=><div key={label as string} className="reference-card rounded-[22px] p-5">
        <div className="flex items-center justify-between"><Icon className="h-4 w-4 text-rose"/><span className="font-heading text-3xl font-bold">{value as string}</span></div>
        <div className="mt-8 text-sm font-medium text-zinc-300">{label as string}</div>
      </div>)}
    </div>

    <div className="mt-5 rounded-[24px] border border-white/[.055] bg-[#09090a]/90 p-5 sm:p-6">
      <div className="flex items-center justify-between"><div><h2 className="font-heading text-sm font-bold">Recent reports</h2><p className="mt-1 text-[10px] text-zinc-600">Reports appear here after an audit is completed.</p></div><span className="rounded-full border border-magenta/15 bg-magenta/[.045] px-2.5 py-1 text-[9px] text-rose">All</span></div>
      <div className="mt-6 grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/[.055] bg-black/25 p-8 text-center">
        <div><FileText className="mx-auto h-6 w-6 text-zinc-800"/><p className="mt-3 text-sm text-zinc-600">No reports yet.</p><p className="mt-1 text-xs text-zinc-700">Run your first website audit to create one.</p></div>
      </div>
    </div>
  </div>;
}
