import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { buildDualReports } from '@/lib/audit/reports';
import { runComprehensiveAudit } from '@/lib/audit/engine';
import { createDemoAudit } from '@/lib/audit/demo';
import { encodeGuestPayload } from '@/lib/audit/guest-payload';
import { normalizeAuditUrl } from '@/lib/audit/url';
import type { AuditDataset, ReportLanguage } from '@/lib/audit/types';
import { getServerUser } from '@/lib/auth/session';
import { getDefaultWorkspaceId } from '@/lib/auth/workspace';
import { getFirebaseAdmin, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { PLANS } from '@/lib/plans';

export const maxDuration = 120;

const languages = new Set<ReportLanguage>(['ENGLISH', 'HINGLISH', 'HINDI', 'BENGALI', 'MARATHI', 'GUJARATI', 'TAMIL', 'TELUGU']);

function parseLanguage(value: unknown): ReportLanguage {
  return typeof value === 'string' && languages.has(value as ReportLanguage) ? value as ReportLanguage : 'HINGLISH';
}

function demoDataset(url: string): AuditDataset {
  const result = createDemoAudit(url);
  const now = new Date().toISOString();
  return {
    requestedUrl: url,
    resolvedUrl: url,
    testedAt: now,
    pages: [],
    discoveredUrls: [url],
    scores: { performance: result.performance, seo: result.seo, accessibility: result.accessibility, bestPractices: result.bestPractices, overall: result.overall },
    mobile: null,
    desktop: null,
    metrics: {},
    infrastructure: { https: url.startsWith('https://'), redirectChain: [url], status: null, server: null, contentType: null, securityHeaders: {}, robots: { status: null, url: `${url}robots.txt`, sitemaps: [], disallowRules: 0 }, sitemap: { status: null, url: null, urlsFound: 0 }, cookies: { count: 0, secure: 0, httpOnly: 0, sameSite: 0 } },
    findings: result.issues.map((issue: any, index: number) => ({ id: `demo-${index}`, key: issue.key, category: issue.category === 'SEO' ? 'SEO' : 'PERFORMANCE', source: 'SCORYN_HTML_CHECK', title: issue.title, description: issue.explanation, severity: issue.severity, affectedUrl: url, metric: null, measuredValue: null, recommendedValue: null, affectedElement: null, selector: null, resourceUrl: null, rawEvidence: { demo: true }, businessImpact: issue.businessImpact, developerFix: null, confidence: 'LOW' })) as AuditDataset['findings'],
    engines: { pageSpeed: 'unavailable', htmlChecks: 'unavailable', unlighthouse: 'unavailable', axeCore: 'unavailable', webCheck: 'unavailable', errors: ['DEMO_AUDIT_MODE is enabled.'] },
    ranking: { searchConsoleConnected: false, actualGoogleRankingAvailable: false, note: 'Demo mode does not confirm actual Google search ranking.' },
    partial: true
  };
}

function legacyResult(dataset: AuditDataset, reports: Awaited<ReturnType<typeof buildDualReports>>) {
  const issueCopy = new Map(reports.business.findings.map((finding) => [finding.findingId, finding]));
  return {
    performance: dataset.scores.performance,
    seo: dataset.scores.seo,
    accessibility: dataset.scores.accessibility,
    bestPractices: dataset.scores.bestPractices,
    overall: dataset.scores.overall,
    mobile: dataset.mobile?.scores || null,
    desktop: dataset.desktop?.scores || null,
    coverage: dataset.mobile && dataset.desktop ? 'mobile+desktop' : dataset.mobile || dataset.desktop ? 'single-device' : 'html-and-configuration',
    partial: dataset.partial,
    source: 'Scoryn normalized audit · PageSpeed/Lighthouse + multi-page discovery + Web Check signals',
    requestedUrl: dataset.requestedUrl,
    resolvedUrl: dataset.resolvedUrl,
    testedAt: dataset.testedAt,
    metrics: dataset.metrics,
    pages: dataset.pages,
    discoveredUrls: dataset.discoveredUrls,
    engines: dataset.engines,
    infrastructure: dataset.infrastructure,
    ranking: dataset.ranking,
    findings: dataset.findings,
    issues: dataset.findings.slice(0, 18).map((finding) => {
      const copy = issueCopy.get(finding.id);
      return { key: finding.key, title: copy?.problem || finding.title, category: finding.category, severity: finding.severity, explanation: copy?.customerExperience || finding.description, businessImpact: copy?.businessImpact || finding.businessImpact || '', technicalDetail: finding.description, affectedUrl: finding.affectedUrl, metric: finding.metric, measuredValue: finding.measuredValue, recommendedValue: finding.recommendedValue, affectedElement: finding.affectedElement, selector: finding.selector, resourceUrl: finding.resourceUrl };
    }),
    businessReport: reports.business,
    developerReport: reports.developer
  };
}

function guestResult(dataset: AuditDataset, reports: Awaited<ReturnType<typeof buildDualReports>>) {
  const full = legacyResult(dataset, reports);
  return {
    performance: full.performance,
    seo: full.seo,
    accessibility: full.accessibility,
    bestPractices: full.bestPractices,
    overall: full.overall,
    coverage: full.coverage,
    partial: full.partial,
    source: full.source,
    requestedUrl: full.requestedUrl,
    resolvedUrl: full.resolvedUrl,
    testedAt: full.testedAt,
    metrics: full.metrics,
    engines: full.engines,
    ranking: full.ranking,
    issues: full.issues,
    businessReport: reports.business,
    developerReport: {
      ...reports.developer,
      pages: reports.developer.pages.map((page) => ({ url: page.url, finalUrl: page.finalUrl, status: page.status, responseMs: page.responseMs, internalLinks: page.internalLinks.length })),
      findings: reports.developer.findings.map((finding) => ({ ...finding, rawEvidence: {}, description: finding.description.slice(0, 500), affectedElement: finding.affectedElement?.slice(0, 300) || null, evidence: finding.evidence.slice(0, 700) }))
    }
  };
}

async function saveAuthenticatedReport(user: { uid: string }, url: string, dataset: AuditDataset, reports: Awaited<ReturnType<typeof buildDualReports>>, language: ReportLanguage) {
  const { db } = getFirebaseAdmin();
  const workspaceId = await getDefaultWorkspaceId(user.uid);
  const workspaceSnap = await db.collection('workspaces').doc(workspaceId).get();
  const planKey = String(workspaceSnap.data()?.plan || 'FREE') as keyof typeof PLANS;
  const plan = PLANS[planKey] || PLANS.FREE;
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const usageId = `${workspaceId}_${monthStart.toISOString().slice(0, 7)}`;
  const usageRef = db.collection('usage').doc(usageId);
  const usageSnap = await usageRef.get();
  const used = Number(usageSnap.data()?.auditCount || 0);
  if (Number.isFinite(plan.audits) && used >= plan.audits) throw new Error(`${plan.name} plan ka monthly audit limit complete ho gaya.`);

  const auditRef = db.collection('audits').doc();
  const publicSlug = randomUUID().replace(/-/g, '').slice(0, 20);
  const auditData = {
    workspaceId, createdById: user.uid, clientId: null, url, requestedUrl: dataset.requestedUrl, resolvedUrl: dataset.resolvedUrl,
    status: 'COMPLETED', currentStep: 'COMPLETE', progress: 100, performanceScore: dataset.scores.performance, seoScore: dataset.scores.seo, accessibilityScore: dataset.scores.accessibility, bestPracticesScore: dataset.scores.bestPractices, overallScore: dataset.scores.overall,
    mobile: dataset.mobile?.scores || null, desktop: dataset.desktop?.scores || null, coverage: dataset.mobile && dataset.desktop ? 'mobile+desktop' : 'multi-page-html', partial: dataset.partial,
    source: 'Scoryn normalized audit · PageSpeed/Lighthouse + multi-page discovery + Web Check signals', reportLanguage: language, publicSlug, isPublic: true,
    rawAuditData: dataset, businessReport: reports.business, developerReport: reports.developer, engineStatus: dataset.engines, createdAt: now, updatedAt: now, completedAt: now
  };
  const batch = db.batch();
  batch.set(auditRef, auditData);
  batch.set(usageRef, { workspaceId, monthStart, auditCount: used + 1, updatedAt: now }, { merge: true });
  for (const finding of dataset.findings.slice(0, 80)) {
    const business = reports.business.findings.find((item) => item.findingId === finding.id);
    const issueRef = db.collection('auditIssues').doc(`${auditRef.id}_${finding.id}`);
    batch.set(issueRef, { auditId: auditRef.id, workspaceId, ...finding, businessFinding: business || null, language, createdAt: now });
  }
  await batch.commit();
  return auditRef.id;
}

async function makeResponse(input: { url?: unknown; language?: unknown }) {
  const url = normalizeAuditUrl(String(input.url ?? ''));
  const language = parseLanguage(input.language);
  const dataset = process.env.DEMO_AUDIT_MODE === 'true' ? demoDataset(url) : await runComprehensiveAudit(url);
  const reports = await buildDualReports(dataset, language);
  const user = await getServerUser();
  const adminReady = isFirebaseAdminConfigured();
  let reportId: string | null = null;
  let storageMode: 'firebase' | 'stateless' = 'stateless';
  const result = legacyResult(dataset, reports);
  if (user && adminReady) {
    try {
      reportId = await saveAuthenticatedReport(user, url, dataset, reports, language);
      storageMode = 'firebase';
    } catch (error) {
      console.warn('[Scoryn Audit] Firebase save failed; returning stateless report instead.', error);
    }
  }
  const payload = { url, result: guestResult(dataset, reports), language, exp: Date.now() + 60 * 60 * 1000 };
  const id = encodeGuestPayload(payload);
  return { id, url, result, language, reportId, authenticated: Boolean(user), storageMode, persistenceAvailable: adminReady };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    return NextResponse.json(await makeResponse({ url: url.searchParams.get('url'), language: url.searchParams.get('language') }));
  } catch (error) {
    console.error('[Scoryn Audit]', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Audit failed.' }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json(await makeResponse({ url: body?.url, language: body?.language }));
  } catch (error) {
    console.error('[Scoryn Audit]', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Audit failed.' }, { status: 400 });
  }
}
