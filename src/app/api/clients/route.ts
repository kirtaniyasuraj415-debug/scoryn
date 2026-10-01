import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { normalizeAuditUrl } from '@/lib/audit/url';

const schema = z.object({ name: z.string().min(2).max(120), website: z.string().min(3), contact: z.string().max(100).optional(), whatsapp: z.string().max(40).optional() });
export async function POST(req: Request) {
  try {
    const user = await requireServerUser();
    const input = schema.parse(await req.json());
    const workspaceId = await getDefaultWorkspaceId(user.uid);
    const { db } = getFirebaseAdmin();
    const ref = db.collection('clients').doc();
    const now = new Date();
    await ref.set({ workspaceId, name: input.name, website: normalizeAuditUrl(input.website), contact: input.contact || null, whatsapp: input.whatsapp || null, createdAt: now, updatedAt: now });
    return NextResponse.json({ id: ref.id });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Client create failed.' }, { status: 400 }); }
}
