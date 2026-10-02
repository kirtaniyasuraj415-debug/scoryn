import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { requireServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { loadReportData } from '@/lib/report/load';
import { ReportPDF } from '@/lib/report/pdf';

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const u=await requireServerUser();
    const {id}=await params;
    const data=await loadReportData(id);
    const workspaceId=await getDefaultWorkspaceId(u.uid);

    if(data.audit.workspaceId!==workspaceId){
      return NextResponse.json({error:'Not found'},{status:404});
    }

    const buf=await renderToBuffer(ReportPDF({data}));
    return new NextResponse(buf as any,{
      headers:{
        'Content-Type':'application/pdf',
        'Content-Disposition':`attachment; filename="scoryn-${id}.pdf"`,
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
