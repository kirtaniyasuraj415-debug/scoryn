import { NextResponse } from 'next/server';
import { normalizeAuditUrl } from '@/lib/audit/url';
import { createDemoAudit } from '@/lib/audit/demo';
import { getServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { explainAuditIssues, isReportLanguage, type ReportLanguage } from '@/lib/audit/explain';
import { PLANS } from '@/lib/plans';
import { randomUUID } from 'crypto';

export const maxDuration = 120;

const PAGESPEED_API_KEY='AIzaSyCy1eDqDWE_Z13bXM0yqLOBBhBc9XfwpxI';
const PAGESPEED_ENDPOINT='https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed';

type Strategy='mobile'|'desktop';

function severity(score:number|null|undefined){
  if(score==null) return 'MEDIUM';
  if(score<0.5) return 'HIGH';
  if(score<0.9) return 'MEDIUM';
  return 'LOW';
}

function cleanDescription(value:unknown){
  if(typeof value!=='string') return '';
  return value
    .replace(/\[([^\]]+)\]\([^\)]+\)/g,'$1')
    .replace(/\x60+/g,'')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,240);
}

async function runPageSpeed(url:string,strategy:Strategy){
  const endpoint=new URL(PAGESPEED_ENDPOINT);
  endpoint.searchParams.set('url',url);
  endpoint.searchParams.set('strategy',strategy);
  for(const category of ['performance','seo','accessibility','best-practices']){
    endpoint.searchParams.append('category',category);
  }
  endpoint.searchParams.set('key',PAGESPEED_API_KEY);

  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),40000);

  try{
    const r=await fetch(endpoint,{
      cache:'no-store',
      signal:controller.signal,
      headers:{accept:'application/json'}
    });

    if(!r.ok){
      const detail=(await r.text()).slice(0,400);
      throw new Error('PageSpeed '+strategy+' failed ('+r.status+'): '+(detail||r.statusText));
    }

    const json:any=await r.json();

    if(json?.lighthouseResult?.runtimeError?.code){
      throw new Error(
        'PageSpeed '+strategy+' runtime error: '+(json.lighthouseResult.runtimeError.message||json.lighthouseResult.runtimeError.code)
      );
    }

    const cats=json?.lighthouseResult?.categories??{};
    const audits=json?.lighthouseResult?.audits??{};

    const scores={
      performance:Math.round((cats.performance?.score??0)*100),
      seo:Math.round((cats.seo?.score??0)*100),
      accessibility:Math.round((cats.accessibility?.score??0)*100),
      bestPractices:Math.round((cats['best-practices']?.score??0)*100)
    };

    const relevantIds=new Set<string>();
    for(const category of Object.values(cats) as any[]){
      for(const ref of category?.auditRefs??[]){
        if((ref?.weight??0)>0 && ref?.id) relevantIds.add(ref.id);
      }
    }

    const issues=[...relevantIds]
      .map(id=>audits[id])
      .filter((audit:any)=>audit && typeof audit.score==='number' && audit.score<0.9 && audit.scoreDisplayMode!=='notApplicable')
      .sort((a:any,b:any)=>(a.score??1)-(b.score??1))
      .slice(0,8)
      .map((audit:any)=>({
        key:String(audit.id||audit.title||'issue'),
        title:String(audit.title||'Website issue'),
        category:'LIGHTHOUSE',
        severity:severity(audit.score),
        explanation:cleanDescription(audit.description)||'This Lighthouse check needs attention.',
        businessImpact:'Fixing this can improve the site experience and technical quality for visitors.'
      }));

    return {
      strategy,
      ...scores,
      issues,
      finalUrl:json?.lighthouseResult?.finalDisplayedUrl||json?.id||url,
      fetchTime:json?.lighthouseResult?.fetchTime||null
    };
  }catch(e){
    if(e instanceof Error && e.name==='AbortError'){
      throw new Error('PageSpeed '+strategy+' timed out after 40 seconds.');
    }
    throw e;
  }finally{
    clearTimeout(timeout);
  }
}

function average(a:number,b:number){
  return Math.round((a+b)/2);
}

function clampScore(value:number){
  return Math.max(0,Math.min(100,Math.round(value)));
}

function createStaticFallback(url:string,html:string,meta:{resolvedUrl:string;responseMs:number;status:number},upstreamErrors:string[]){
  const title=/<title[^>]*>\s*[^<]{2,}\s*<\/title>/i.test(html);
  const description=/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}["']/i.test(html)
    || /<meta[^>]+content=["'][^"']{20,}["'][^>]+name=["']description["']/i.test(html);
  const viewport=/<meta[^>]+name=["']viewport["']/i.test(html);
  const lang=/<html[^>]+lang=["'][^"']+["']/i.test(html);
  const h1=/<h1\b[^>]*>[^<]*<\/h1>/i.test(html);
  const canonical=/<link[^>]+rel=["']canonical["']/i.test(html);
  const noindex=/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  const images=(html.match(/<img\b[^>]*>/gi)||[]);
  const missingAlt=images.filter(tag=>!/\balt\s*=\s*["'][^"']*["']/i.test(tag)).length;

  let seo=100;
  if(!title) seo-=20;
  if(!description) seo-=20;
  if(!h1) seo-=15;
  if(!canonical) seo-=10;
  if(noindex) seo-=35;

  let accessibility=100;
  if(!lang) accessibility-=15;
  if(!h1) accessibility-=10;
  accessibility-=Math.min(30,missingAlt*5);

  let bestPractices=url.startsWith('https://')?100:75;
  if(!viewport) bestPractices-=10;

  const issues:any[]=[];
  const add=(key:string,titleText:string,severityText:string,explanation:string,businessImpact:string)=>{
    issues.push({key,title:titleText,category:'STATIC_CHECK',severity:severityText,explanation,businessImpact});
  };

  if(!title) add('missing-title','Page title is missing','HIGH','The page does not expose a clear HTML title in the initial response.','A clear title helps browsers and search engines understand the page.');
  if(!description) add('missing-meta-description','Meta description is missing or too short','MEDIUM','The initial HTML does not contain a useful meta description.','A concise description can improve how the page is presented in search results.');
  if(!h1) add('missing-h1','Primary H1 heading was not detected','MEDIUM','The initial HTML does not expose a clear H1 heading.','A clear page heading improves structure for visitors and search engines.');
  if(!canonical) add('missing-canonical','Canonical URL was not detected','LOW','The initial HTML does not contain a canonical link.','Canonical URLs help search engines understand the preferred version of a page.');
  if(!lang) add('missing-lang','HTML language is not declared','MEDIUM','The document does not declare a language on the html element.','Language metadata helps assistive technology interpret content correctly.');
  if(missingAlt>0) add('missing-image-alt',String(missingAlt)+' image(s) may be missing alt text','MEDIUM','Some images in the initial HTML do not expose an alt attribute.','Useful alt text improves accessibility for screen-reader users.');
  if(noindex) add('noindex','Page appears to contain a noindex directive','HIGH','The page tells search engines not to index it.','A noindex directive can prevent the page from appearing in Google Search.');

  if(!issues.length){
    add('pagespeed-timeout','Google Lighthouse could not finish this URL','MEDIUM','Google PageSpeed timed out, so Scoryn completed only a lightweight server-side technical scan.','The page may still need a full Lighthouse run when Google can complete the audit.');
  }

  return {
    performance:null,
    seo:clampScore(seo),
    accessibility:clampScore(accessibility),
    bestPractices:clampScore(bestPractices),
    overall:null,
    mobile:null,
    desktop:null,
    coverage:'fallback-static',
    partial:true,
    responseMs:meta.responseMs,
    httpStatus:meta.status,
    requestedUrl:url,
    resolvedUrl:meta.resolvedUrl,
    issues:issues.slice(0,6),
    source:'Scoryn fallback technical scan',
    upstream:'Google PageSpeed Insights / Lighthouse timed out for this URL',
    upstreamErrors,
    testedAt:new Date().toISOString()
  };
}

async function createRealAudit(url:string){
  let auditUrl=url;
  let html='';
  let responseMs=0;
  let httpStatus=0;
  const preflightController=new AbortController();
  const preflightTimeout=setTimeout(()=>preflightController.abort(),10000);
  try{
    const started=Date.now();
    const preflight=await fetch(url,{
      method:'GET',
      redirect:'follow',
      cache:'no-store',
      signal:preflightController.signal,
      headers:{'user-agent':'Scoryn-Audit/1.0'}
    });
    responseMs=Date.now()-started;
    httpStatus=preflight.status;
    if(!preflight.ok && preflight.status>=500){
      throw new Error('Target website returned HTTP '+preflight.status+'.');
    }
    auditUrl=preflight.url||url;
    const contentType=preflight.headers.get('content-type')||'';
    if(contentType.includes('text/html')){
      html=(await preflight.text()).slice(0,1200000);
    }
  }catch(e){
    if(e instanceof Error && e.name==='AbortError'){
      throw new Error('Target website did not respond within 10 seconds.');
    }
    throw e;
  }finally{
    clearTimeout(preflightTimeout);
  }

  const settled=await Promise.allSettled([
    runPageSpeed(auditUrl,'mobile'),
    runPageSpeed(auditUrl,'desktop')
  ]);

  const mobile=settled[0].status==='fulfilled'?settled[0].value:null;
  const desktop=settled[1].status==='fulfilled'?settled[1].value:null;

  if(!mobile&&!desktop){
    const reasons=settled
      .map(x=>x.status==='rejected'?(x.reason instanceof Error?x.reason.message:String(x.reason)):'')
      .filter(Boolean);
    if(html){
      return createStaticFallback(url,html,{resolvedUrl:auditUrl,responseMs,status:httpStatus},reasons);
    }
    throw new Error(reasons.join(' | ')||'Google PageSpeed could not complete this audit.');
  }

  const performance=mobile&&desktop?average(mobile.performance,desktop.performance):(mobile?.performance??desktop!.performance);
  const seo=mobile&&desktop?average(mobile.seo,desktop.seo):(mobile?.seo??desktop!.seo);
  const accessibility=mobile&&desktop?average(mobile.accessibility,desktop.accessibility):(mobile?.accessibility??desktop!.accessibility);
  const bestPractices=mobile&&desktop?average(mobile.bestPractices,desktop.bestPractices):(mobile?.bestPractices??desktop!.bestPractices);

  const result={
    performance,
    seo,
    accessibility,
    bestPractices,
    mobile:mobile?{
      performance:mobile.performance,
      seo:mobile.seo,
      accessibility:mobile.accessibility,
      bestPractices:mobile.bestPractices
    }:null,
    desktop:desktop?{
      performance:desktop.performance,
      seo:desktop.seo,
      accessibility:desktop.accessibility,
      bestPractices:desktop.bestPractices
    }:null,
    coverage:mobile&&desktop?'mobile+desktop':mobile?'mobile-only':'desktop-only',
    issues:[...(mobile?.issues??[]),...(desktop?.issues??[])]
      .filter((issue,index,list)=>list.findIndex(x=>x.key===issue.key)===index)
      .slice(0,6),
    source:'Google PageSpeed Insights / Lighthouse',
    requestedUrl:url,
    resolvedUrl:auditUrl,
    testedAt:new Date().toISOString()
  };

  const overall=Math.round(
    (result.performance+result.seo+result.accessibility+result.bestPractices)/4
  );

  return {...result,overall};
}

async function saveAuthenticatedReport(
  user:{uid:string},
  url:string,
  result:any,
  language:ReportLanguage
){
  const {db}=getFirebaseAdmin();
  const workspaceId=await getDefaultWorkspaceId(user.uid);

  const [workspaceSnap,brandingSnap]=await Promise.all([
    db.collection('workspaces').doc(workspaceId).get(),
    db.collection('branding').doc(workspaceId).get()
  ]);

  const plan=(workspaceSnap.data()?.plan||'FREE') as keyof typeof PLANS;
  const now=new Date();
  const monthStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));
  const usageId=`${workspaceId}_${monthStart.toISOString().slice(0,7)}`;
  const usageRef=db.collection('usage').doc(usageId);
  const usageSnap=await usageRef.get();
  const used=Number(usageSnap.data()?.auditCount||0);
  const limit=PLANS[plan].audits;

  if(Number.isFinite(limit)&&used>=limit){
    throw new Error(`${PLANS[plan].name} plan ka monthly audit limit complete ho gaya.`);
  }

  const issues=await explainAuditIssues(Array.isArray(result.issues)?result.issues:[],language);
  const auditRef=db.collection('audits').doc();
  const publicSlug=randomUUID().replace(/-/g,'').slice(0,20);

  const auditData={
    workspaceId,
    createdById:user.uid,
    clientId:null,
    url,
    status:'COMPLETED',
    currentStep:'COMPLETE',
    progress:100,
    performanceScore:typeof result.performance==='number'?result.performance:null,
    seoScore:typeof result.seo==='number'?result.seo:null,
    accessibilityScore:typeof result.accessibility==='number'?result.accessibility:null,
    bestPracticesScore:typeof result.bestPractices==='number'?result.bestPractices:null,
    overallScore:typeof result.overall==='number'?result.overall:null,
    mobile:result.mobile??null,
    desktop:result.desktop??null,
    coverage:result.coverage??null,
    partial:Boolean(result.partial),
    source:result.source||'Google PageSpeed Insights / Lighthouse',
    requestedUrl:result.requestedUrl||url,
    resolvedUrl:result.resolvedUrl||url,
    reportLanguage:language,
    publicSlug,
    isPublic:true,
    createdAt:now,
    updatedAt:now,
    completedAt:now
  };

  const batch=db.batch();
  batch.set(auditRef,auditData);
  batch.set(usageRef,{
    workspaceId,
    monthStart,
    auditCount:used+1,
    updatedAt:now
  },{merge:true});

  for(const issue of issues){
    const issueRef=db.collection('auditIssues').doc();
    batch.set(issueRef,{
      auditId:auditRef.id,
      workspaceId,
      key:issue.key,
      title:issue.title,
      category:issue.category||'LIGHTHOUSE',
      severity:issue.severity||'MEDIUM',
      explanation:issue.explanation,
      businessImpact:issue.businessImpact||'',
      technicalDetail:issue.technicalDetail||null,
      language,
      createdAt:now
    });
  }

  await batch.commit();

  return {
    reportId:auditRef.id,
    result:{...result,issues},
    agencyName:brandingSnap.data()?.agencyName||null
  };
}

async function makeResponse(input:{url?:unknown;language?:unknown}){
  const url=normalizeAuditUrl(String(input.url??''));
  const demo=process.env.DEMO_AUDIT_MODE==='true';
  const user=await getServerUser();
  const adminReady=isFirebaseAdminConfigured();

  let language:ReportLanguage='ENGLISH';

  if(isReportLanguage(input.language)){
    language=input.language;
  }else if(user&&adminReady){
    try{
      const {db}=getFirebaseAdmin();
      const workspaceId=await getDefaultWorkspaceId(user.uid);
      const branding=await db.collection('branding').doc(workspaceId).get();
      const saved=branding.data()?.reportLanguage;
      if(isReportLanguage(saved)) language=saved;
      else language='HINGLISH';
    }catch{
      language='HINGLISH';
    }
  }else if(user){
    language='HINGLISH';
  }

  let result:any=demo ? createDemoAudit(url) : await createRealAudit(url);
  let reportId:string|null=null;
  let persisted=false;

  if(user&&adminReady){
    try{
      const saved=await saveAuthenticatedReport(user,url,result,language);
      result=saved.result;
      reportId=saved.reportId;
      persisted=true;
    }catch(e){
      console.warn('[Scoryn Audit] Report persistence skipped; returning completed audit.',e);
      result={...result,issues:await explainAuditIssues(Array.isArray(result.issues)?result.issues:[],language)};
    }
  }else{
    result={...result,issues:await explainAuditIssues(Array.isArray(result.issues)?result.issues:[],language)};
  }

  const payload={url,result,language,exp:Date.now()+60*60*1000};
  const id=Buffer.from(JSON.stringify(payload)).toString('base64url');

  return {
    id,
    url,
    result,
    language,
    reportId,
    authenticated:Boolean(user),
    persisted
  };
}

export async function GET(req:Request){
  try{
    const url=new URL(req.url);
    const data=await makeResponse({
      url:url.searchParams.get('url'),
      language:url.searchParams.get('language')
    });
    return NextResponse.json(data);
  }catch(e){
    console.error('[Scoryn Audit]',e);
    return NextResponse.json({
      error:e instanceof Error?e.message:'Audit failed.'
    },{status:400});
  }
}

export async function POST(req:Request){
  try{
    const body=await req.json();
    const data=await makeResponse({
      url:body?.url,
      language:body?.language
    });
    return NextResponse.json(data);
  }catch(e){
    console.error('[Scoryn Audit]',e);
    return NextResponse.json({
      error:e instanceof Error?e.message:'Audit failed.'
    },{status:400});
  }
}