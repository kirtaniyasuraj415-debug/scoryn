import Link from 'next/link';
import { FileText, ExternalLink, Search, Share2 } from 'lucide-react';
import { getServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin, isFirebaseAdminConfigured } from '@/lib/firebase/admin';

export default async function ReportsPage() {
  const user = await getServerUser();
  const rows: any[] = [];
  if (user && isFirebaseAdminConfigured()) {
    try {
      const { db } = getFirebaseAdmin();
      const workspaceId = await getDefaultWorkspaceId(user.uid);
      const snapshots = await db.collection('audits').where('workspaceId', '==', workspaceId).orderBy('createdAt', 'desc').limit(50).get();
      rows.push(...snapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.warn('[Scoryn reports] history unavailable', error);
    }
  }
  const completed = rows.filter((row) => row.status === 'COMPLETED');
  const shared = completed.filter((row) => row.isPublic && row.publicSlug).length;
  return <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-6xl px-4 py-10 pb-20 sm:px-8 lg:py-14"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] uppercase tracking-[.24em] text-rose/70">Reports</p><h1 className="mt-2 font-heading text-3xl font-bold tracking-[-.035em] sm:text-4xl">Client-ready reports</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600">Every successful audit keeps one raw dataset with both Business Owner and Developer report modes.</p></div><div className="flex h-10 w-full max-w-xs items-center gap-2 rounded-xl border border-white/[.055] bg-white/[.018] px-3 text-xs text-zinc-700 sm:w-[260px]"><Search className="h-3.5 w-3.5" /><span>Search reports…</span></div></div><div className="mt-8 grid gap-3 sm:grid-cols-3">{[[FileText, 'Completed reports', String(completed.length)], [Share2, 'Shared with clients', String(shared)], [FileText, 'Stored audit datasets', String(rows.length)]].map(([Icon, label, value]) => <div key={String(label)} className="reference-card rounded-[22px] p-5"><div className="flex items-center justify-between"><Icon className="h-4 w-4 text-rose" /><span className="font-heading text-3xl font-bold">{String(value)}</span></div><div className="mt-8 text-sm font-medium text-zinc-300">{String(label)}</div></div>)}</div><div className="mt-5 rounded-[24px] border border-white/[.055] bg-[#09090a]/90 p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-heading text-sm font-bold">Recent reports</h2><p className="mt-1 text-[10px] text-zinc-600">Open either report mode without re-running the audit.</p></div><span className="rounded-full border border-magenta/15 bg-magenta/[.045] px-2.5 py-1 text-[9px] text-rose">{rows.length ? `${rows.length} saved` : 'All'}</span></div>{rows.length ? <div className="mt-6 space-y-2">{rows.map((row) => <div key={row.id} className="flex flex-col gap-4 rounded-2xl border border-white/[.055] bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="truncate text-sm text-zinc-300">{row.url}</div><div className="mt-1 text-xs text-zinc-700">{row.status || 'QUEUED'} · {row.overallScore ?? '—'} overall · {row.reportLanguage || 'ENGLISH'}</div></div><div className="flex flex-wrap gap-2"><Link href={`/dashboard/report/${row.id}?mode=business`} className="rounded-full border border-magenta/20 bg-magenta/[.05] px-3 py-2 text-[11px] text-rose">Business report</Link><Link href={`/dashboard/report/${row.id}?mode=developer`} className="rounded-full border border-white/[.08] px-3 py-2 text-[11px] text-zinc-400">Developer report</Link>{row.publicSlug && <Link href={`/r/${row.publicSlug}`} target="_blank" className="grid h-8 w-8 place-items-center rounded-full border border-white/[.08] text-zinc-500" aria-label="Open shared report"><ExternalLink className="h-3.5 w-3.5" /></Link>}</div></div>)}</div> : <div className="mt-6 grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/[.055] bg-black/25 p-8 text-center"><div><FileText className="mx-auto h-6 w-6 text-zinc-800" /><p className="mt-3 text-sm text-zinc-600">No reports yet.</p><p className="mt-1 text-xs text-zinc-700">Run your first website audit to create both report modes.</p><Link href="/dashboard/audit/new" className="mt-4 inline-flex rounded-full border border-magenta/20 bg-magenta/[.06] px-4 py-2 text-xs text-rose">Run an audit</Link></div></div>}</div></div>;
}
