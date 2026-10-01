import { NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

const ALLOWED = new Set(['image/png','image/jpeg','image/webp','image/svg+xml']);
export async function POST(req: Request) {
  try {
    const user = await requireServerUser();
    const workspaceId = await getDefaultWorkspaceId(user.uid);
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Logo file missing.' }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'PNG, JPG, WebP or SVG logo use karo.' }, { status: 400 });
    if (file.size > 3 * 1024 * 1024) return NextResponse.json({ error: 'Logo 3MB se chhota hona chahiye.' }, { status: 400 });
    const { db, storage } = getFirebaseAdmin();
    const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'png';
    const key = `workspace-assets/${workspaceId}/logo-${Date.now()}.${ext}`;
    const bucket = storage.bucket();
    const object = bucket.file(key);
    await object.save(Buffer.from(await file.arrayBuffer()), { metadata: { contentType: file.type }, resumable: false });
    await object.makePublic();
    const logoUrl = `https://storage.googleapis.com/${bucket.name}/${key}`;
    await db.collection('branding').doc(workspaceId).set({ logoUrl, updatedAt: new Date() }, { merge: true });
    return NextResponse.json({ logoUrl });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Logo upload failed.' }, { status: 400 });
  }
}
