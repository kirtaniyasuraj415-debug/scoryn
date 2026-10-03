import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { normalizeAuditUrl } from '@/lib/audit/url';
import { PLANS } from '@/lib/plans';

const schema = z.object({ url: z.string().min(3), clientName: z.string().max(120).optional(), industry: z.string().max(100).optional(), language: z.string().optional() });

export async function POST(req: Request) {
  try {
    const user = await requireServerUser();
    const input = schema.parse(await req.json());
    const url = normalizeAuditUrl(input.url);
    const { db } = getFirebaseAdmin();
    const workspaceId = await getDefaultWorkspaceId(user.uid);
    const ws = await db.collection('workspaces').doc(workspaceId).get();
    const plan = (ws.data()?.plan || 'FREE') as keyof typeof PLANS;
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const usageId = `${workspaceId}_${monthStart.toISOString().slice(0, 7)}`;
    const usageRef = db.collection('usage').doc(usageId);
    const usageSnap = await usageRef.get();
    const used = Number(usageSnap.data()?.auditCount || 0);
    const limit = PLANS[plan].audits;
    if (Number.isFinite(limit) && used >= limit) return NextResponse.json({ error: `${PLANS[plan].name} plan ka monthly audit limit complete ho gaya.` }, { status: 429 });
    let clientId: string | null = null;
    if (input.clientName) {
      const client = db.collection('clients').doc();
      await client.set({ workspaceId, name: input.clientName, website: url, industry: input.industry || null, createdAt: now, updatedAt: now });
      clientId = client.id;
    }
    const audit = db.collection('audits').doc();
    const job = db.collection('auditJobs').doc(audit.id);
    const batch = db.batch();
    batch.set(audit, { workspaceId, createdById: user.uid, clientId, url, industry: input.industry || null, reportLanguage: input.language || 'HINGLISH', status: 'QUEUED', currentStep: 'DISCOVERING_PAGES', progress: 5, createdAt: now, updatedAt: now });
    const githubWorker = process.env.AUDIT_WORKER_MODE === 'github-actions' && Boolean(process.env.GITHUB_AUDIT_WORKER_TOKEN);
    batch.set(job, { auditId: audit.id, workspaceId, url, language: input.language || 'HINGLISH', status: 'QUEUED', workerMode: githubWorker ? 'github-actions' : 'firebase', createdAt: now });
    batch.set(usageRef, { workspaceId, monthStart, auditCount: used + 1, updatedAt: now }, { merge: true });
    await batch.commit();
    if (githubWorker) {
      const repository = process.env.GITHUB_AUDIT_REPOSITORY || 'kirtaniyasuraj415-debug/scoryn';
      const dispatch = await fetch(`https://api.github.com/repos/${repository}/dispatches`, { method: 'POST', headers: { accept: 'application/vnd.github+json', 'content-type': 'application/json', authorization: `Bearer ${process.env.GITHUB_AUDIT_WORKER_TOKEN}`, 'user-agent': 'Scoryn-Audit-Dispatcher' }, body: JSON.stringify({ event_type: 'scoryn-audit', client_payload: { auditId: audit.id, jobId: audit.id, url, language: input.language || 'HINGLISH' } }) });
      if (!dispatch.ok) {
        console.warn('[Scoryn Audit] GitHub worker dispatch failed; falling back to Firebase worker.', dispatch.status);
        const fallbackJob = db.collection('auditJobs').doc(`${audit.id}_fallback`);
        await fallbackJob.set({ auditId: audit.id, workspaceId, url, language: input.language || 'HINGLISH', status: 'QUEUED', workerMode: 'firebase', fallbackFor: audit.id, createdAt: new Date() });
      }
    }
    return NextResponse.json({ id: audit.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';
    return NextResponse.json({ error: message === 'UNAUTHENTICATED' ? 'Please log in.' : message }, { status: message === 'UNAUTHENTICATED' ? 401 : 400 });
  }
}
