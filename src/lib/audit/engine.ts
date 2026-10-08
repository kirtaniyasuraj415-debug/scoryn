import { normalizeAuditUrl } from '@/lib/audit/url';
import type {
  AuditDataset,
  AuditFinding,
  AuditScores,
  FindingConfidence,
  FindingSeverity,
  InfrastructureSignals,
  PageSnapshot,
  PageSpeedResult
} from '@/lib/audit/types';

export const MAX_DISCOVERED_PAGES = 8;
const USER_AGENT = 'Scoryn-Audit/2.0 (+https://scoryn-eight.vercel.app)';

const metricInfo: Record<string, { label: string; recommended: string }> = {
  'largest-contentful-paint': { label: 'Largest Contentful Paint', recommended: '< 2.5s' },
  'first-contentful-paint': { label: 'First Contentful Paint', recommended: '< 1.8s' },
  'speed-index': { label: 'Speed Index', recommended: '< 3.4s' },
  'total-blocking-time': { label: 'Total Blocking Time', recommended: '< 200ms' },
  'cumulative-layout-shift': { label: 'Cumulative Layout Shift', recommended: '< 0.1' },
  interactive: { label: 'Time to Interactive', recommended: '< 3.8s' }
};

const securityHeaderNames = [
  'strict-transport-security',
  'content-security-policy',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy'
];

function text(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match?.[1]?.trim() || null;
}

function findMeta(html: string, name: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find((candidate) => {
    const key = attribute(candidate, 'name') || attribute(candidate, 'property');
    return key?.toLowerCase() === name.toLowerCase();
  });
  return tag ? attribute(tag, 'content') : null;
}

function isSameOrigin(candidate: string, base: URL) {
  try {
    return new URL(candidate, base).origin === base.origin;
  } catch {
    return false;
  }
}

function normalizeLink(raw: string, base: URL) {
  try {
    const url = new URL(raw, base);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function hash(value: string) {
  let result = 0;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result.toString(36);
}

function findingId(key: string, url: string | null) {
  return `finding-${hash(`${key}|${url || ''}`)}`;
}

function severityForScore(score: number | null | undefined): FindingSeverity {
  if (score == null || score < 0.5) return 'HIGH';
  if (score < 0.9) return 'MEDIUM';
  return 'LOW';
}

function genericImpact(category: AuditFinding['category']) {
  if (category === 'PERFORMANCE') return 'A slower first view can make visitors leave before they understand the business or offer.';
  if (category === 'SEO') return 'Clearer page signals can help search engines understand and present the right page.';
  if (category === 'ACCESSIBILITY') return 'The issue can make parts of the website harder to use for people using assistive technology.';
  if (category === 'SECURITY') return 'Stronger browser and transport signals reduce avoidable configuration risk.';
  return 'Fixing this can make the website more reliable and easier to use.';
}

function makeFinding(input: Omit<AuditFinding, 'id' | 'businessImpact'> & { businessImpact?: string | null }): AuditFinding {
  return {
    ...input,
    id: findingId(input.key, input.affectedUrl),
    businessImpact: input.businessImpact ?? genericImpact(input.category)
  };
}

function safeEvidence(value: unknown) {
  if (!value || typeof value !== 'object') return {};
  const object = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(object).slice(0, 20));
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      redirect: init.redirect || 'follow',
      signal: controller.signal,
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', ...(init.headers || {}) }
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPageSnapshot(url: string): Promise<{ snapshot: PageSnapshot; response: Response; html: string }> {
  const started = Date.now();
  const response = await fetchWithTimeout(url);
  const contentType = response.headers.get('content-type') || '';
  const html = contentType.includes('html') ? (await response.text()).slice(0, 900_000) : '';
  const base = new URL(response.url || url);
  const imageTags = html.match(/<img\b[^>]*>/gi) || [];
  const links = html.match(/<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>/gi) || [];
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();
  for (const tag of links) {
    const candidate = attribute(tag, 'href');
    const normalized = candidate ? normalizeLink(candidate, base) : null;
    if (!normalized) continue;
    if (isSameOrigin(normalized, base)) internalLinks.add(normalized);
    else externalLinks.add(normalized);
  }
  const h1s = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || [];
  const headings = html.match(/<h[1-6]\b[^>]*>/gi) || [];
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) || []).find((tag) => (attribute(tag, 'rel') || '').toLowerCase().split(/\s+/).includes('canonical'));
  const snapshot: PageSnapshot = {
    url,
    finalUrl: response.url || url,
    status: response.status,
    responseMs: Date.now() - started,
    contentType,
    title: titleMatch ? text(titleMatch[1]).slice(0, 300) || null : null,
    metaDescription: findMeta(html, 'description')?.slice(0, 320) || null,
    canonical: canonicalTag ? attribute(canonicalTag, 'href') : null,
    robots: findMeta(html, 'robots'),
    lang: html.match(/<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i)?.[1] || null,
    h1Count: h1s.length,
    h1Text: h1s[0] ? text(h1s[0]).slice(0, 300) || null : null,
    headingCount: headings.length,
    imageCount: imageTags.length,
    imagesWithoutAlt: imageTags.filter((tag) => attribute(tag, 'alt') === null).length,
    internalLinks: [...internalLinks].slice(0, 40),
    externalLinks: [...externalLinks].slice(0, 40),
    jsonLdCount: (html.match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/gi) || []).length,
    htmlBytes: Buffer.byteLength(html)
  };
  return { snapshot, response, html };
}

function parseSitemapUrls(xml: string, origin: string) {
  const values = [...xml.matchAll(/<loc[^>]*>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim());
  return values.filter((candidate) => {
    try {
      return new URL(candidate).origin === origin;
    } catch {
      return false;
    }
  });
}

async function getTextResource(url: string) {
  try {
    const response = await fetchWithTimeout(url, { headers: { accept: 'text/plain,application/xml,text/xml,*/*' } }, 9000);
    const body = await response.text();
    return { response, body };
  } catch {
    return { response: null, body: '' };
  }
}

async function discoverUrls(home: { snapshot: PageSnapshot; response: Response; html: string }) {
  const base = new URL(home.snapshot.finalUrl);
  const robotsUrl = new URL('/robots.txt', base).toString();
  const robots = await getTextResource(robotsUrl);
  const sitemapCandidates = new Set<string>();
  for (const line of robots.body.split(/\r?\n/)) {
    const match = line.match(/^\s*sitemap:\s*(\S+)/i);
    if (match) sitemapCandidates.add(match[1]);
  }
  sitemapCandidates.add(new URL('/sitemap.xml', base).toString());
  const sitemapUrls: string[] = [];
  let sitemapStatus: number | null = null;
  let sitemapUrl: string | null = null;
  for (const candidate of [...sitemapCandidates].slice(0, 3)) {
    const result = await getTextResource(candidate);
    if (!result.response?.ok) continue;
    sitemapStatus = result.response.status;
    sitemapUrl = candidate;
    const firstLevel = parseSitemapUrls(result.body, base.origin);
    sitemapUrls.push(...firstLevel);
    if (result.body.includes('<sitemapindex')) {
      for (const child of firstLevel.slice(0, 3)) {
        const nested = await getTextResource(child);
        if (nested.response?.ok) sitemapUrls.push(...parseSitemapUrls(nested.body, base.origin));
      }
    }
    break;
  }
  const discovered = new Set<string>([base.toString()]);
  for (const url of sitemapUrls) discovered.add(url);
  for (const url of home.snapshot.internalLinks) discovered.add(url);
  const urls = [...discovered].filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.origin === base.origin && !/\.(?:jpg|jpeg|png|gif|webp|svg|pdf|zip|css|js|xml)$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  }).slice(0, MAX_DISCOVERED_PAGES);
  return {
    urls,
    robots: {
      status: robots.response?.status ?? null,
      url: robotsUrl,
      sitemaps: [...sitemapCandidates].slice(0, 5),
      disallowRules: robots.body.split(/\r?\n/).filter((line) => /^\s*disallow:/i.test(line) && line.split(':')[1]?.trim()).length
    },
    sitemap: { status: sitemapStatus, url: sitemapUrl, urlsFound: sitemapUrls.length }
  };
}

function pageFindings(page: PageSnapshot): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const base = {
    affectedUrl: page.finalUrl,
    metric: null,
    measuredValue: null,
    recommendedValue: null,
    affectedElement: null,
    selector: null,
    resourceUrl: null,
    confidence: 'HIGH' as FindingConfidence
  };
  if (!page.title) findings.push(makeFinding({ ...base, key: 'missing-title', category: 'SEO', source: 'SCORYN_HTML_CHECK', title: 'Page title is missing', description: 'No title element was found in the initial HTML.', severity: 'HIGH', rawEvidence: { title: null }, developerFix: 'Add one descriptive title element that matches the page content.' }));
  if (!page.metaDescription) findings.push(makeFinding({ ...base, key: 'missing-meta-description', category: 'SEO', source: 'SCORYN_HTML_CHECK', title: 'Meta description is missing', description: 'No meta description was found in the initial HTML.', severity: 'MEDIUM', rawEvidence: { metaDescription: null }, developerFix: 'Add a concise, page-specific meta description.' }));
  if (!page.h1Count) findings.push(makeFinding({ ...base, key: 'missing-h1', category: 'SEO', source: 'SCORYN_HTML_CHECK', title: 'Primary H1 heading was not detected', description: 'No H1 heading was found in the initial HTML.', severity: 'MEDIUM', rawEvidence: { h1Count: page.h1Count }, developerFix: 'Add one clear H1 that describes the page subject.' }));
  if (!page.canonical) findings.push(makeFinding({ ...base, key: 'missing-canonical', category: 'SEO', source: 'SCORYN_HTML_CHECK', title: 'Canonical URL was not detected', description: 'No canonical link was found in the initial HTML.', severity: 'LOW', rawEvidence: { canonical: null }, developerFix: 'Add a canonical link when this page has a preferred URL.' }));
  if (!page.lang) findings.push(makeFinding({ ...base, key: 'missing-html-lang', category: 'ACCESSIBILITY', source: 'SCORYN_HTML_CHECK', title: 'HTML language is not declared', description: 'The html element does not expose a lang attribute in the initial HTML.', severity: 'MEDIUM', rawEvidence: { lang: null }, developerFix: 'Set the html lang attribute to the actual page language.' }));
  if (page.imagesWithoutAlt) findings.push(makeFinding({ ...base, key: 'missing-image-alt', category: 'ACCESSIBILITY', source: 'SCORYN_HTML_CHECK', title: `${page.imagesWithoutAlt} image(s) may be missing alt text`, description: 'The initial HTML contains image elements without an alt attribute.', severity: 'MEDIUM', rawEvidence: { imageCount: page.imageCount, imagesWithoutAlt: page.imagesWithoutAlt }, developerFix: 'Add useful alt text to informative images and an empty alt attribute to decorative images.' }));
  if (page.robots?.toLowerCase().includes('noindex')) findings.push(makeFinding({ ...base, key: 'noindex', category: 'SEO', source: 'SCORYN_HTML_CHECK', title: 'Page has a noindex directive', description: 'The robots meta tag includes noindex.', severity: 'HIGH', rawEvidence: { robots: page.robots }, developerFix: 'Remove noindex only if this page is intended to appear in search results.' }));
  return findings;
}

function securityFindings(signals: InfrastructureSignals, url: string): AuditFinding[] {
  const findings: AuditFinding[] = [];
  if (!signals.https) findings.push(makeFinding({ key: 'not-https', category: 'SECURITY', source: 'WEB_CHECK_ADAPTER', title: 'Website is not using HTTPS', description: 'The requested URL uses HTTP rather than HTTPS.', severity: 'HIGH', affectedUrl: url, metric: null, measuredValue: 'http', recommendedValue: 'https', affectedElement: null, selector: null, resourceUrl: null, rawEvidence: { requestedProtocol: 'http:' }, developerFix: 'Serve the site over HTTPS and redirect HTTP requests to the HTTPS URL.', confidence: 'HIGH' }));
  for (const name of securityHeaderNames) {
    const signal = signals.securityHeaders[name];
    if (!signal?.present) findings.push(makeFinding({ key: `missing-security-header-${name}`, category: 'SECURITY', source: 'WEB_CHECK_ADAPTER', title: `${name} header is missing`, description: `The response did not include the ${name} security header.`, severity: name === 'content-security-policy' ? 'LOW' : 'LOW', affectedUrl: url, metric: null, measuredValue: null, recommendedValue: 'present', affectedElement: null, selector: null, resourceUrl: null, rawEvidence: { header: name, value: signal?.value ?? null }, developerFix: `Review and add a correct ${name} policy for this site.`, confidence: 'HIGH' }));
  }
  return findings;
}

function categoryForAudit(id: string, categoryByAudit: Map<string, AuditFinding['category']>) {
  return categoryByAudit.get(id) || (id.includes('seo') ? 'SEO' : id.includes('aria') || id.includes('contrast') || id.includes('label') ? 'ACCESSIBILITY' : 'PERFORMANCE');
}

function auditElement(audit: any) {
  const item = Array.isArray(audit?.details?.items) ? audit.details.items[0] : null;
  const node = item?.node || audit?.details?.node || null;
  return {
    item,
    affectedElement: typeof node?.snippet === 'string' ? node.snippet.slice(0, 600) : null,
    selector: typeof node?.selector === 'string' ? node.selector.slice(0, 500) : null,
    resourceUrl: typeof item?.url === 'string' ? item.url : typeof item?.request?.url === 'string' ? item.request.url : null
  };
}

function lighthouseFindings(json: any, affectedUrl: string): { result: Omit<PageSpeedResult, 'findings' | 'error'>; findings: AuditFinding[] } {
  const lighthouse = json?.lighthouseResult || {};
  const categories = lighthouse.categories || {};
  const audits = lighthouse.audits || {};
  const categoryByAudit = new Map<string, AuditFinding['category']>();
  for (const [key, category] of Object.entries(categories) as Array<[string, any]>) {
    const mapped = key === 'best-practices' ? 'BEST_PRACTICES' : key.toUpperCase() as AuditFinding['category'];
    for (const ref of category?.auditRefs || []) if (ref?.id) categoryByAudit.set(ref.id, mapped);
  }
  const metricRecords: PageSpeedResult['metrics'] = {};
  for (const [id, info] of Object.entries(metricInfo)) {
    const audit = audits[id];
    if (!audit) continue;
    metricRecords[id] = { label: info.label, numericValue: typeof audit.numericValue === 'number' ? audit.numericValue : null, displayValue: typeof audit.displayValue === 'string' ? audit.displayValue : null };
  }
  const findings: AuditFinding[] = [];
  const ids = Object.keys(audits).filter((id) => {
    const audit = audits[id];
    return typeof audit?.score === 'number' && audit.score < 0.9 && audit.scoreDisplayMode !== 'notApplicable' && Boolean(categoryByAudit.get(id));
  }).sort((a, b) => (audits[a].score ?? 1) - (audits[b].score ?? 1)).slice(0, 20);
  for (const id of ids) {
    const audit = audits[id];
    const category = categoryForAudit(id, categoryByAudit);
    const element = auditElement(audit);
    const metric = metricInfo[id];
    const numericValue = typeof audit.numericValue === 'number' ? audit.numericValue : null;
    const displayValue = typeof audit.displayValue === 'string' ? audit.displayValue : null;
    const errorItems = id === 'errors-in-console' && Array.isArray(audit.details?.items) ? audit.details.items.slice(0, 5).map((item: any) => item?.errorMessage || item?.description || item?.message || item).filter(Boolean) : undefined;
    findings.push(makeFinding({
      key: id,
      category,
      source: 'PAGESPEED_LIGHTHOUSE',
      title: String(audit.title || id),
      description: String(audit.description || 'Lighthouse reported this check below its passing threshold.').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim().slice(0, 800),
      severity: severityForScore(audit.score),
      affectedUrl: lighthouse.finalDisplayedUrl || lighthouse.finalUrl || affectedUrl,
      metric: metric?.label || null,
      measuredValue: numericValue ?? displayValue,
      recommendedValue: metric?.recommended || null,
      affectedElement: element.affectedElement,
      selector: element.selector,
      resourceUrl: element.resourceUrl,
      rawEvidence: safeEvidence({ auditId: id, score: audit.score, displayValue, numericValue, scoreDisplayMode: audit.scoreDisplayMode, consoleErrors: errorItems, detailsType: audit.details?.type }),
      developerFix: String(audit.description || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim().slice(0, 800) || null,
      confidence: 'HIGH'
    }));
  }
  const result = {
    strategy: (json?.analysisUTCTimestamp ? undefined : undefined) as never,
    finalUrl: lighthouse.finalDisplayedUrl || lighthouse.finalUrl || affectedUrl,
    scores: {
      performance: typeof categories.performance?.score === 'number' ? Math.round(categories.performance.score * 100) : null,
      seo: typeof categories.seo?.score === 'number' ? Math.round(categories.seo.score * 100) : null,
      accessibility: typeof categories.accessibility?.score === 'number' ? Math.round(categories.accessibility.score * 100) : null,
      bestPractices: typeof categories['best-practices']?.score === 'number' ? Math.round(categories['best-practices'].score * 100) : null
    },
    metrics: metricRecords
  };
  return { result, findings };
}

async function runPageSpeed(url: string, strategy: 'mobile' | 'desktop'): Promise<PageSpeedResult> {
  const endpoint = new URL('https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('strategy', strategy);
  for (const category of ['performance', 'seo', 'accessibility', 'best-practices']) endpoint.searchParams.append('category', category);
  const key = process.env.PAGESPEED_API_KEY;
  if (key) endpoint.searchParams.set('key', key);
  try {
    const response = await fetchWithTimeout(endpoint.toString(), { headers: { accept: 'application/json' } }, 42_000);
    if (!response.ok) throw new Error(`PageSpeed ${strategy} failed (${response.status})`);
    const json = await response.json();
    if (json?.lighthouseResult?.runtimeError?.code) throw new Error(`PageSpeed ${strategy}: ${json.lighthouseResult.runtimeError.message || json.lighthouseResult.runtimeError.code}`);
    const extracted = lighthouseFindings(json, url);
    return { ...extracted.result, strategy, findings: extracted.findings, error: null };
  } catch (error) {
    return { strategy, finalUrl: url, scores: { performance: null, seo: null, accessibility: null, bestPractices: null }, metrics: {}, findings: [], error: error instanceof Error && error.name === 'AbortError' ? `PageSpeed ${strategy} timed out.` : error instanceof Error ? error.message : `PageSpeed ${strategy} failed.` };
  }
}

function average(values: Array<number | null>) {
  const present = values.filter((value): value is number => typeof value === 'number');
  return present.length ? Math.round(present.reduce((sum, value) => sum + value, 0) / present.length) : null;
}

function staticScore(pages: PageSnapshot[], type: 'seo' | 'accessibility' | 'bestPractices') {
  if (!pages.length) return null;
  return Math.round(pages.reduce((sum, page) => {
    let score = 100;
    if (type === 'seo') score -= (!page.title ? 20 : 0) + (!page.metaDescription ? 15 : 0) + (!page.h1Count ? 15 : 0) + (!page.canonical ? 10 : 0) + (page.robots?.toLowerCase().includes('noindex') ? 35 : 0);
    if (type === 'accessibility') score -= (!page.lang ? 15 : 0) + Math.min(35, page.imagesWithoutAlt * 5);
    if (type === 'bestPractices') score -= page.finalUrl.startsWith('https://') ? 0 : 25;
    return sum + Math.max(0, score);
  }, 0) / pages.length);
}

async function brokenLinkFindings(pages: PageSnapshot[]) {
  const links = [...new Set(pages.flatMap((page) => page.internalLinks))].slice(0, 12);
  const findings: AuditFinding[] = [];
  await Promise.all(links.map(async (url) => {
    try {
      const response = await fetchWithTimeout(url, { method: 'HEAD', headers: { accept: '*/*' } }, 7000);
      if (response.status >= 400) findings.push(makeFinding({ key: 'broken-internal-link', category: 'SEO', source: 'SCORYN_HTML_CHECK', title: 'Broken internal link detected', description: `An internal link returned HTTP ${response.status}.`, severity: response.status >= 500 ? 'HIGH' : 'MEDIUM', affectedUrl: url, metric: 'HTTP status', measuredValue: response.status, recommendedValue: '< 400', affectedElement: null, selector: null, resourceUrl: url, rawEvidence: { status: response.status, method: 'HEAD' }, developerFix: 'Update or remove the link, and verify the destination returns a successful response.', confidence: 'HIGH' }));
    } catch {
      // A failed HEAD request is not enough evidence to call a link broken.
    }
  }));
  return findings;
}

export async function runComprehensiveAudit(requestedUrl: string): Promise<AuditDataset> {
  const url = normalizeAuditUrl(requestedUrl);
  const errors: string[] = [];
  const home = await fetchPageSnapshot(url);
  const discovery = await discoverUrls(home);
  const pageResults = await Promise.allSettled(discovery.urls.map((pageUrl) => pageUrl === home.snapshot.url ? Promise.resolve(home) : fetchPageSnapshot(pageUrl)));
  const pages = pageResults.filter((result): result is PromiseFulfilledResult<{ snapshot: PageSnapshot; response: Response; html: string }> => result.status === 'fulfilled').map((result) => result.value.snapshot);
  if (!pages.length) pages.push(home.snapshot);
  for (const result of pageResults) if (result.status === 'rejected') errors.push(result.reason instanceof Error ? result.reason.message : 'A discovered page could not be fetched.');

  const homeResponse = home.response;
  const securityHeaders = Object.fromEntries(securityHeaderNames.map((name) => [name, { present: Boolean(homeResponse.headers.get(name)), value: homeResponse.headers.get(name) }]));
  const setCookie = homeResponse.headers.get('set-cookie') || '';
  const cookies = setCookie ? setCookie.split(/,(?=[^;]+=[^;]+)/).map((cookie) => cookie.trim()) : [];
  const infrastructure: InfrastructureSignals = {
    https: new URL(home.snapshot.finalUrl).protocol === 'https:',
    redirectChain: home.snapshot.finalUrl !== url ? [url, home.snapshot.finalUrl] : [url],
    status: homeResponse.status,
    server: homeResponse.headers.get('server'),
    contentType: homeResponse.headers.get('content-type'),
    securityHeaders,
    robots: discovery.robots,
    sitemap: discovery.sitemap,
    cookies: { count: cookies.length, secure: cookies.filter((cookie) => /;\s*secure(?:;|$)/i.test(cookie)).length, httpOnly: cookies.filter((cookie) => /;\s*httponly(?:;|$)/i.test(cookie)).length, sameSite: cookies.filter((cookie) => /;\s*samesite=/i.test(cookie)).length }
  };

  const [mobile, desktop, brokenLinks] = await Promise.all([runPageSpeed(home.snapshot.finalUrl, 'mobile'), runPageSpeed(home.snapshot.finalUrl, 'desktop'), brokenLinkFindings(pages)]);
  if (mobile.error) errors.push(mobile.error);
  if (desktop.error) errors.push(desktop.error);
  const pageIssues = pages.flatMap(pageFindings);
  const infraIssues = securityFindings(infrastructure, home.snapshot.finalUrl);
  const allFindings = [...mobile.findings, ...desktop.findings, ...pageIssues, ...infraIssues, ...brokenLinks].filter((finding, index, list) => list.findIndex((candidate) => candidate.key === finding.key && candidate.affectedUrl === finding.affectedUrl) === index);
  const scores: AuditScores = {
    performance: average([mobile.scores.performance, desktop.scores.performance]),
    seo: average([mobile.scores.seo, desktop.scores.seo]) ?? staticScore(pages, 'seo'),
    accessibility: average([mobile.scores.accessibility, desktop.scores.accessibility]) ?? staticScore(pages, 'accessibility'),
    bestPractices: average([mobile.scores.bestPractices, desktop.scores.bestPractices]) ?? staticScore(pages, 'bestPractices'),
    overall: null
  };
  const availableScores = [scores.performance, scores.seo, scores.accessibility, scores.bestPractices].filter((value): value is number => typeof value === 'number');
  scores.overall = availableScores.length ? Math.round(availableScores.reduce((sum, value) => sum + value, 0) / availableScores.length) : null;
  const metrics = { ...mobile.metrics, ...desktop.metrics };
  const engines = {
    pageSpeed: mobile.error && desktop.error ? 'unavailable' : mobile.error || desktop.error ? 'partial' : 'complete',
    htmlChecks: pages.length ? 'complete' : 'unavailable',
    unlighthouse: 'fallback-discovery',
    axeCore: mobile.error && desktop.error ? 'unavailable' : 'lighthouse-fallback',
    webCheck: infrastructure.status ? 'complete' : 'unavailable',
    errors: [...new Set(errors)].slice(0, 8)
  } as const;
  return {
    requestedUrl: url,
    resolvedUrl: home.snapshot.finalUrl,
    testedAt: new Date().toISOString(),
    pages,
    discoveredUrls: discovery.urls,
    scores,
    mobile: mobile.error ? null : mobile,
    desktop: desktop.error ? null : desktop,
    metrics,
    infrastructure,
    findings: allFindings,
    engines,
    ranking: { searchConsoleConnected: false, actualGoogleRankingAvailable: false, note: 'Technical SEO checks do not confirm actual Google search ranking. Search Console data is not connected to this audit.' },
    partial: Boolean(mobile.error || desktop.error)
  };
}
