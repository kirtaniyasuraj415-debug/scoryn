import { notFound } from 'next/navigation';
import { getServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { ScoreCircle } from '@/components/report/score-circle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DownloadPdfButton } from '@/components/report/download-pdf-button';
import { ExternalLink } from 'lucide-react';

const languageLabel:Record<string,string>={
  ENGLISH:'English',
  HINGLISH:'Hinglish',
  HINDI:'हिन्दी',
  BENGALI:'বাংলা',
  MARATHI:'मराठी',
  GUJARATI:'ગુજરાતી',
  TAMIL:'தமிழ்',
  TELUGU:'తెలుగు'
};

export default async function Report({params}:{params:Promise<{id:string}>}){
  const u=await getServerUser();
  if(!u) notFound();

  const {id}=await params;
  const {db}=getFirebaseAdmin();
  const workspaceId=await getDefaultWorkspaceId(u.uid);
  const a=await db.collection('audits').doc(id).get();

  if(!a.exists||a.data()?.workspaceId!==workspaceId) notFound();

  const d=a.data()!;
  const issuesSnap=await db.collection('auditIssues').where('auditId','==',id).limit(50).get();
  const issues=issuesSnap.docs.map(x=>({id:x.id,...x.data()} as any));
  const partial=Boolean(d.partial);

  const scoreCards=[
    ['Performance',d.performanceScore],
    [partial?'Technical SEO':'SEO',d.seoScore],
    ['Accessibility',d.accessibilityScore],
    ['Best Practices',d.bestPracticesScore]
  ];

  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[.24em] text-rose">{partial?'Partial technical audit':'Audit report'}</p>
        <h1 className="mt-3 break-all text-2xl font-medium sm:text-4xl">{d.url}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
          <span>{partial?'Scoryn fallback technical scan':'Mobile + desktop merged result'}</span>
          <span>•</span>
          <span>{languageLabel[d.reportLanguage]||'English'}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <DownloadPdfButton reportId={id}/>
        {d.publicSlug&&<Button asChild>
          <a href={`/r/${d.publicSlug}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4"/>Share link
          </a>
        </Button>}
      </div>
    </div>

    {partial&&<div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-400/[.035] p-4 text-sm text-zinc-400">
      Google Lighthouse could not finish this URL, so Scoryn saved a partial technical scan instead of inventing a performance score.
    </div>}

    <div className="mt-8 grid gap-4 rounded-3xl border border-white/[.07] bg-[#0d0d0d] p-6 md:grid-cols-[170px_1fr]">
      <div className="grid place-items-center">
        {typeof d.overallScore==='number'
          ? <ScoreCircle score={d.overallScore}/>
          : <div className="grid h-28 w-28 place-items-center rounded-full border-[7px] border-magenta/50 text-center">
              <div><div className="text-3xl">—</div><div className="text-[10px] text-zinc-600">PARTIAL</div></div>
            </div>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {scoreCards.map(([label,score])=><div key={label as string} className="rounded-2xl border border-white/[.06] bg-black/30 p-4">
          <div className="text-2xl font-medium">{typeof score==='number'?score:'—'}</div>
          <div className="mt-1 text-xs text-zinc-600">{label as string}</div>
        </div>)}
      </div>
    </div>

    <section className="mt-8 space-y-3">
      <div className="mb-5">
        <h2 className="text-2xl">Issues that matter</h2>
        <p className="mt-1 text-sm text-zinc-600">Technical finding + simple business impact in your selected report language.</p>
      </div>

      {issues.length===0
        ? <div className="rounded-2xl border border-white/[.07] p-7 text-sm text-zinc-600">No issue details stored for this audit yet.</div>
        : issues.map((i:any)=><details key={i.id} className="group rounded-2xl border border-white/[.07] bg-[#0d0d0d] p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{i.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{i.explanation}</p>
                </div>
                <Badge className="text-rose">{i.severity}</Badge>
              </div>
            </summary>

            <div className="mt-5 border-t border-white/[.06] pt-5">
              <p className="text-xs uppercase tracking-wider text-zinc-600">Business impact</p>
              <p className="mt-2 text-sm text-zinc-300">{i.businessImpact}</p>

              {i.technicalDetail&&<>
                <p className="mt-5 text-xs uppercase tracking-wider text-zinc-600">Technical detail</p>
                <p className="mt-2 text-sm text-zinc-500">{i.technicalDetail}</p>
              </>}
            </div>
          </details>)}
    </section>
  </div>;
}
