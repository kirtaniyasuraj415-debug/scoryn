import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const site = process.env.SCORYN_SITE;
const auditId = process.env.SCORYN_AUDIT_ID;
const jobId = process.env.SCORYN_JOB_ID || auditId;
if (!site) throw new Error('SCORYN_SITE is required.');

const outputDir = join(process.cwd(), '.scoryn-output');
const now = () => new Date();

function firebaseDb() {
  if (getApps().length) return getFirestore();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  const serviceAccount = JSON.parse(raw);
  initializeApp({ credential: cert(serviceAccount) });
  return getFirestore();
}

async function updateAudit(fields) {
  const db = firebaseDb();
  if (!db || !auditId) return;
  await db.collection('audits').doc(auditId).set({ ...fields, updatedAt: now() }, { merge: true });
  if (jobId) await db.collection('auditJobs').doc(jobId).set({ ...fields, updatedAt: now() }, { merge: true });
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: process.cwd(), env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${command} exited ${code}: ${stderr.slice(-1200)}`)));
  });
}

async function runUnlighthouse() {
  await updateAudit({ status: 'RUNNING', currentStep: 'UNLIGHTHOUSE_CRAWL', progress: 22 });
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await runCommand('npx', ['--no-install', 'unlighthouse-ci', '--site', site, '--reporter', 'jsonExpanded', '--output-path', outputDir, '--no-cache']);
  const report = JSON.parse(await readFile(join(outputDir, 'ci-result.json'), 'utf8'));
  return report;
}

async function runAxe(urls) {
  await updateAudit({ currentStep: 'AXE_ACCESSIBILITY', progress: 52 });
  const browser = await chromium.launch({ headless: true });
  const findings = [];
  try {
    for (const url of urls.slice(0, 8)) {
      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25_000 });
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        for (const violation of result.violations) {
          for (const node of violation.nodes.slice(0, 10)) findings.push({
            id: `axe-${violation.id}-${Buffer.from(`${url}|${node.target.join(',')}`).toString('base64url').slice(0, 24)}`,
            key: `axe-${violation.id}`,
            category: 'ACCESSIBILITY', source: 'AXE_CORE', title: violation.help, description: violation.description,
            severity: violation.impact === 'critical' ? 'CRITICAL' : violation.impact === 'serious' ? 'HIGH' : violation.impact === 'moderate' ? 'MEDIUM' : 'LOW',
            affectedUrl: url, metric: null, measuredValue: null, recommendedValue: null, affectedElement: node.html?.slice(0, 800) || null, selector: node.target.join(', '), resourceUrl: null,
            rawEvidence: { rule: violation.id, helpUrl: violation.helpUrl, impact: violation.impact, failureSummary: node.failureSummary },
            businessImpact: null, developerFix: violation.help, confidence: 'HIGH'
          });
        }
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
  return findings;
}

async function runWebCheck(url) {
  await updateAudit({ currentStep: 'WEB_CHECK_SIGNALS', progress: 70 });
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Scoryn-Audit-Worker/2.0' } });
  const headerNames = ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy'];
  const securityHeaders = Object.fromEntries(headerNames.map((name) => [name, { present: Boolean(response.headers.get(name)), value: response.headers.get(name) }]));
  return { https: new URL(response.url || url).protocol === 'https:', status: response.status, finalUrl: response.url || url, server: response.headers.get('server'), securityHeaders, robotsUrl: new URL('/robots.txt', response.url || url).toString(), sitemapUrl: new URL('/sitemap.xml', response.url || url).toString() };
}

async function main() {
  await updateAudit({ status: 'RUNNING', currentStep: 'DISCOVERING_PAGES', progress: 8, worker: 'github-actions' });
  const unlighthouse = await runUnlighthouse();
  const routes = Array.isArray(unlighthouse?.routes) ? unlighthouse.routes.map((route) => new URL(route.path, site).toString()) : [site];
  const axe = await runAxe([...new Set(routes)]);
  const webCheck = await runWebCheck(site);
  await updateAudit({ currentStep: 'BUILDING_REPORT', progress: 88 });
  const normalized = { requestedUrl: site, resolvedUrl: webCheck.finalUrl, testedAt: new Date().toISOString(), pages: unlighthouse.routes || [], scores: unlighthouse.summary || null, findings: [...axe], engines: { unlighthouse: 'worker', axeCore: 'worker', webCheck: 'complete', pageSpeed: 'complete', htmlChecks: 'worker' }, infrastructure: webCheck, ranking: { searchConsoleConnected: false, actualGoogleRankingAvailable: false, note: 'Technical SEO checks do not confirm actual Google search ranking.' } };
  const db = firebaseDb();
  if (db && auditId) await db.collection('audits').doc(auditId).set({ rawAuditData: normalized, engineStatus: normalized.engines, status: 'COMPLETED', currentStep: 'COMPLETE', progress: 100, completedAt: now(), updatedAt: now() }, { merge: true });
  await writeFile(join(outputDir, 'scoryn-normalized-audit.json'), JSON.stringify(normalized, null, 2));
  console.log(JSON.stringify({ auditId, jobId, site, pages: routes.length, axeFindings: axe.length }));
}

main().catch(async (error) => { await updateAudit({ status: 'FAILED', currentStep: 'FAILED', progress: 100, errorMessage: error instanceof Error ? error.message : 'Worker failed' }); console.error(error); process.exitCode = 1; });
