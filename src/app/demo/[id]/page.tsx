import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Save, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DownloadDemoPdfButton } from '@/components/report/download-demo-pdf-button';

export default async function DemoPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  let payload:{url:string;result:any;language?:string;exp:number}|null=null;

  try{
    payload=JSON.parse(Buffer.from(id,'base64url').toString());
  }catch{
    notFound();
  }

  if(!payload||payload.exp<Date.now()) notFound();

  const r=payload.result;
  const partial=Boolean(r.partial);
  const scores=[
    ['Performance',r.performance],
    [partial?'Technical SEO (fallback)':'SEO',r.seo],
    [partial?'Accessibility checks':'Accessibility',r.accessibility],
    [partial?'Best-practice checks':'Best Practices',r.bestPractices]
  ];

  return <main className="min-h-screen bg-[#070707] px-4 py-6 text-white sm:px-8">
    <div className="mx-auto max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white">
        <ArrowLeft className="h-4 w-4"/>Back
      </Link>

      <div className="mt-10 rounded-3xl border border-white/[.08] bg-[#0d0d0d] p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[.26em] text-rose">{partial?'Partial technical audit':'Website audit'}</p>
            <h1 className="mt-3 break-all text-2xl font-medium sm:text-4xl">{payload.url}</h1>
            <p className="mt-3 text-xs text-zinc-600">{r.source||'Google PageSpeed Insights / Lighthouse'}</p>
          </div>

          <div className="grid h-28 w-28 place-items-center rounded-full border-[7px] border-magenta/70">
            <div className="text-center">
              <div className="text-3xl font-medium">{typeof r.overall==='number'?r.overall:'—'}</div>
              <div className="text-[10px] text-zinc-500">{partial?'PARTIAL':'OVERALL'}</div>
            </div>
          </div>
        </div>

        {partial&&<div className="mt-6 flex gap-3 rounded-2xl border border-amber-400/10 bg-amber-400/[.035] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"/>
          <div>
            <div className="text-sm text-zinc-300">Google Lighthouse could not finish this URL.</div>
            <p className="mt-1 text-xs leading-6 text-zinc-600">
              Scoryn returned a lightweight server-side technical scan instead. Performance is intentionally left unavailable rather than inventing a score.
            </p>
          </div>
        </div>}

        <div className="mt-10 grid gap-3 sm:grid-cols-4">
          {scores.map(([label,score])=><div key={label as string} className="rounded-2xl border border-white/[.07] bg-black/30 p-4">
            <div className="text-2xl font-medium">{typeof score==='number'?score:'—'}</div>
            <div className="mt-1 text-xs text-zinc-500">{label as string}</div>
          </div>)}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/[.08]">
          <div className="border-b border-white/[.08] p-5">
            <h2 className="text-lg">Top issues</h2>
          </div>

          {Array.isArray(r.issues)&&r.issues.length
            ? r.issues.map((issue:any)=><div key={issue.key} className="border-b border-white/[.06] p-5 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3>{issue.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{issue.explanation}</p>
                    {issue.businessImpact&&<p className="mt-2 max-w-2xl text-xs leading-6 text-zinc-700">{issue.businessImpact}</p>}
                  </div>
                  <span className="rounded-full border border-magenta/30 bg-magenta/10 px-2.5 py-1 text-[10px] text-rose">{issue.severity}</span>
                </div>
              </div>)
            : <div className="p-5 text-sm text-zinc-600">No priority issues were returned.</div>}
        </div>

        <div className="mt-8 rounded-2xl border border-white/[.08] bg-gradient-to-r from-magenta/10 to-transparent p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg">Basic PDF download — no login required</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Is audit ka basic Scoryn PDF seedha download karo. Login sirf saved history, custom agency branding, client management aur reusable public reports ke liye chahiye.
              </p>
            </div>
            <DownloadDemoPdfButton reportId={id}/>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/[.06] bg-black/25 p-5">
          <div className="flex items-start gap-3">
            <Save className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500"/>
            <div className="flex-1">
              <h3 className="text-sm text-zinc-300">Want to save this workflow?</h3>
              <p className="mt-1 text-xs leading-6 text-zinc-600">Account banane par reports save hongi, branding apply hogi aur dashboard history milegi.</p>
              <Button asChild variant="accent" className="mt-4">
                <Link href="/signup"><Zap className="h-4 w-4"/>Create free account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>;
}
