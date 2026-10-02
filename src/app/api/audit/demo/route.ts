import { NextResponse } from 'next/server';
import { normalizeAuditUrl } from '@/lib/audit/url';
import { createDemoAudit } from '@/lib/audit/demo';

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
  const timeout=setTimeout(()=>controller.abort(),50000);

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
      throw new Error('PageSpeed '+strategy+' timed out after 50 seconds.');
    }
    throw e;
  }finally{
    clearTimeout(timeout);
  }
}

function average(a:number,b:number){
  return Math.round((a+b)/2);
}

async function createRealAudit(url:string){
  let auditUrl=url;
  const preflightController=new AbortController();
  const preflightTimeout=setTimeout(()=>preflightController.abort(),10000);
  try{
    const preflight=await fetch(url,{
      method:'GET',
      redirect:'follow',
      cache:'no-store',
      signal:preflightController.signal,
      headers:{'user-agent':'Scoryn-Audit/1.0'}
    });
    if(!preflight.ok && preflight.status>=500){
      throw new Error('Target website returned HTTP '+preflight.status+'.');
    }
    auditUrl=preflight.url||url;
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
      .filter(Boolean)
      .join(' | ');
    throw new Error(reasons||'Google PageSpeed could not complete this audit.');
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

async function makeResponse(raw:unknown){
  const url=normalizeAuditUrl(String(raw??''));
  const demo=process.env.DEMO_AUDIT_MODE==='true';
  const result=demo ? createDemoAudit(url) : await createRealAudit(url);
  const payload={url,result,exp:Date.now()+60*60*1000};
  const id=Buffer.from(JSON.stringify(payload)).toString('base64url');
  return {id,url,result};
}

export async function GET(req:Request){
  try{
    const raw=new URL(req.url).searchParams.get('url');
    const data=await makeResponse(raw);
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
    const {url}=await req.json();
    const data=await makeResponse(url);
    return NextResponse.json({id:data.id});
  }catch(e){
    console.error('[Scoryn Audit]',e);
    return NextResponse.json({
      error:e instanceof Error?e.message:'Audit failed.'
    },{status:400});
  }
}
