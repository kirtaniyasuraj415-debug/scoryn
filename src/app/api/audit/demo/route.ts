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
  const lower=html.toLowerCase();
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
