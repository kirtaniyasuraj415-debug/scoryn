import { getServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { AddClientButton, WhatsAppReportButton } from '@/components/clients/client-tools';

export default async function Clients(){
  const u=await getServerUser(); const {db}=getFirebaseAdmin(); const w=await getDefaultWorkspaceId(u!.uid);
  const q=await db.collection('clients').where('workspaceId','==',w).orderBy('createdAt','desc').limit(100).get();
  const rows=await Promise.all(q.docs.map(async x=>{const c={id:x.id,...x.data()} as any;const audits=await db.collection('audits').where('clientId','==',x.id).where('status','==','COMPLETED').orderBy('createdAt','desc').limit(1).get();const a=audits.empty?null:audits.docs[0].data();const base=process.env.NEXT_PUBLIC_APP_URL||'';return {...c,shareUrl:a?.publicSlug?`${base}/r/${a.publicSlug}`:null}}));
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[.24em] text-rose">Clients</p><h1 className="mt-2 text-3xl font-medium">Client workspace</h1></div><AddClientButton/></div><div className="mt-8 overflow-hidden rounded-2xl border border-white/[.07] bg-[#0d0d0d]">{rows.length===0?<div className="p-10 text-center text-sm text-zinc-600">Clients created from audits will appear here.</div>:rows.map(c=><div key={c.id} className="grid gap-3 border-b border-white/[.06] p-5 last:border-0 sm:grid-cols-[1fr_1fr_auto] sm:items-center"><div><div>{c.name}</div><div className="mt-1 text-xs text-zinc-600">{c.contact||c.industry||'No contact added'}</div></div><div className="truncate text-sm text-zinc-500">{c.website}</div><WhatsAppReportButton phone={c.whatsapp} shareUrl={c.shareUrl}/></div>)}</div></div>
}
