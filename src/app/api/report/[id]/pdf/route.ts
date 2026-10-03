import { NextResponse } from 'next/server';
import { Font, renderToBuffer } from '@react-pdf/renderer';
import { requireServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { loadReportData } from '@/lib/report/load';
import { ReportPDF } from '@/lib/report/pdf';

const fontFamilies:Record<string,string>={
  HINDI:'Noto Sans Devanagari',
  MARATHI:'Noto Sans Devanagari',
  BENGALI:'Noto Sans Bengali',
  GUJARATI:'Noto Sans Gujarati',
  TAMIL:'Noto Sans Tamil',
  TELUGU:'Noto Sans Telugu'
};

const registeredFonts=new Set<string>();

async function ensureReportFont(language:string|undefined){
  const googleFamily=language?fontFamilies[language]:undefined;
  if(!googleFamily) return 'Helvetica';

  const pdfFamily='Scoryn '+googleFamily;
  if(registeredFonts.has(pdfFamily)) return pdfFamily;

  try{
    const cssUrl='https://fonts.googleapis.com/css2?family='+
      encodeURIComponent(googleFamily)+':wght@400&display=swap';
    const cssRes=await fetch(cssUrl,{
      cache:'force-cache',
      headers:{'user-agent':'Mozilla/5.0'}
    });
    if(!cssRes.ok) return 'Helvetica';

    const css=await cssRes.text();
    const match=css.match(/src:\s*url\((https:[^)]+)\)\s*format\(['"]woff2['"]\)/i);
    const src=match?.[1];
    if(!src) return 'Helvetica';

    Font.register({
      family:pdfFamily,
      src,
      fontWeight:400
    });
    registeredFonts.add(pdfFamily);
    return pdfFamily;
  }catch(e){
    console.error('[Scoryn PDF font]',e);
    return 'Helvetica';
  }
}

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const u=await requireServerUser();
    const {id}=await params;
    const data=await loadReportData(id);
    const workspaceId=await getDefaultWorkspaceId(u.uid);

    if(data.audit.workspaceId!==workspaceId){
      return NextResponse.json({error:'Not found'},{status:404});
    }

    const mode=req.url?new URL(req.url).searchParams.get('mode'):'business';
    const reportMode=mode==='developer'?'developer':'business';
    const fontFamily=await ensureReportFont(data.audit.reportLanguage);
    const buf=await renderToBuffer(ReportPDF({data,fontFamily,mode:reportMode}));
    return new NextResponse(buf as any,{
      headers:{
        'Content-Type':'application/pdf',
        'Content-Disposition':`attachment; filename="scoryn-${reportMode}-${id}.pdf"`,
        'Cache-Control':'private, no-store'
      }
    });
  }catch(e){
    const message=e instanceof Error?e.message:'PDF failed';
    return NextResponse.json(
      {error:message==='UNAUTHENTICATED'?'Session expired. Please refresh and try again.':message},
      {status:message==='UNAUTHENTICATED'?401:400}
    );
  }
}
