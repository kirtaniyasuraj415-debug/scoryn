import { NextResponse } from 'next/server';
import { normalizeAuditUrl } from '@/lib/audit/url';
import { createDemoAudit } from '@/lib/audit/demo';

export async function POST(req: Request) {
  try {
    const { url: raw } = await req.json();
    const url = normalizeAuditUrl(raw);
    const demo = process.env.DEMO_AUDIT_MODE === 'true' || !process.env.PAGESPEED_API_KEY;

    if (!demo) {
      const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
      endpoint.searchParams.set('url', url);
      endpoint.searchParams.set('strategy', 'mobile');
      endpoint.searchParams.set('category', 'performance');
      endpoint.searchParams.append('category', 'seo');
      endpoint.searchParams.append('category', 'accessibility');
      endpoint.searchParams.append('category', 'best-practices');
      endpoint.searchParams.set('key', process.env.PAGESPEED_API_KEY!);
      const r = await fetch(endpoint, { cache: 'no-store' });
      if (!r.ok) throw new Error('PageSpeed audit failed.');
      const json = await r.json();
      const cats = json.lighthouseResult?.categories ?? {};
      const result = {
        performance: Math.round((cats.performance?.score ?? 0) * 100),
        seo: Math.round((cats.seo?.score ?? 0) * 100),
        accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
        bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
        issues: []
      };
      const overall = Math.round((result.performance + result.seo + result.accessibility + result.bestPractices) / 4);
      const payload = { url, result: { ...result, overall }, exp: Date.now() + 60 * 60 * 1000 };
      const id = Buffer.from(JSON.stringify(payload)).toString('base64url');
      return NextResponse.json({ id });
    }

    const result = createDemoAudit(url);
    const id = Buffer.from(JSON.stringify({ url, result, exp: Date.now()+60*60*1000 })).toString('base64url');
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid request.' }, { status: 400 });
  }
}
