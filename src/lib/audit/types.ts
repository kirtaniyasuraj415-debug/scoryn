export type ReportLanguage =
  | 'ENGLISH'
  | 'HINGLISH'
  | 'HINDI'
  | 'BENGALI'
  | 'MARATHI'
  | 'GUJARATI'
  | 'TAMIL'
  | 'TELUGU';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type AuditFinding = {
  id: string;
  key: string;
  category: 'PERFORMANCE' | 'SEO' | 'ACCESSIBILITY' | 'BEST_PRACTICES' | 'SECURITY' | 'DISCOVERY';
  source: 'PAGESPEED_LIGHTHOUSE' | 'AXE_CORE' | 'UNLIGHTHOUSE' | 'WEB_CHECK_ADAPTER' | 'SCORYN_HTML_CHECK';
  title: string;
  description: string;
  severity: FindingSeverity;
  affectedUrl: string | null;
  metric: string | null;
  measuredValue: number | string | null;
  recommendedValue: number | string | null;
  affectedElement: string | null;
  selector: string | null;
  resourceUrl: string | null;
  rawEvidence: Record<string, unknown>;
  businessImpact: string | null;
  developerFix: string | null;
  confidence: FindingConfidence;
};

export type PageSnapshot = {
  url: string;
  finalUrl: string;
  status: number;
  responseMs: number;
  contentType: string;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robots: string | null;
  lang: string | null;
  h1Count: number;
  h1Text: string | null;
  headingCount: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: string[];
  externalLinks: string[];
  jsonLdCount: number;
  htmlBytes: number;
};

export type PageSpeedResult = {
  strategy: 'mobile' | 'desktop';
  finalUrl: string;
  scores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
  };
  metrics: Record<string, { label: string; numericValue: number | null; displayValue: string | null }>;
  findings: AuditFinding[];
  error: string | null;
};

export type InfrastructureSignals = {
  https: boolean;
  redirectChain: string[];
  status: number | null;
  server: string | null;
  contentType: string | null;
  securityHeaders: Record<string, { present: boolean; value: string | null }>;
  robots: { status: number | null; url: string; sitemaps: string[]; disallowRules: number };
  sitemap: { status: number | null; url: string | null; urlsFound: number };
  cookies: { count: number; secure: number; httpOnly: number; sameSite: number };
};

export type AuditEngineStatus = {
  pageSpeed: 'complete' | 'partial' | 'unavailable';
  htmlChecks: 'complete' | 'partial' | 'unavailable';
  unlighthouse: 'worker' | 'fallback-discovery' | 'unavailable';
  axeCore: 'worker' | 'lighthouse-fallback' | 'unavailable';
  webCheck: 'complete' | 'partial' | 'unavailable';
  errors: string[];
};

export type AuditScores = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  overall: number | null;
};

export type AuditDataset = {
  requestedUrl: string;
  resolvedUrl: string;
  testedAt: string;
  pages: PageSnapshot[];
  discoveredUrls: string[];
  scores: AuditScores;
  mobile: PageSpeedResult | null;
  desktop: PageSpeedResult | null;
  metrics: Record<string, { label: string; numericValue: number | null; displayValue: string | null }>;
  infrastructure: InfrastructureSignals;
  findings: AuditFinding[];
  engines: AuditEngineStatus;
  ranking: {
    searchConsoleConnected: false;
    actualGoogleRankingAvailable: false;
    note: string;
  };
  partial: boolean;
};

export type BusinessFinding = {
  findingId: string;
  problem: string;
  where: string;
  customerExperience: string;
  businessImpact: string;
  importance: FindingSeverity;
  recommendedAction: string;
  technicalEvidence: string | null;
};

export type DeveloperFinding = AuditFinding & {
  likelyCause: string | null;
  evidence: string;
};

export type BusinessReport = {
  mode: 'business-owner';
  language: ReportLanguage;
  title: string;
  summary: string;
  workingWell: string[];
  needsAttention: string[];
  customerExperience: string[];
  googleVisibility: string;
  rankingDisclaimer: string;
  topPriorities: Array<{ findingId: string; title: string; reason: string }>;
  findings: BusinessFinding[];
  nextSteps: string[];
};

export type DeveloperReport = {
  mode: 'developer';
  language: ReportLanguage;
  title: string;
  summary: string;
  scores: AuditScores;
  pages: PageSnapshot[];
  metrics: AuditDataset['metrics'];
  infrastructure: InfrastructureSignals;
  engineStatus: AuditEngineStatus;
  findings: DeveloperFinding[];
  ranking: AuditDataset['ranking'];
};

export type DualAuditReport = {
  business: BusinessReport;
  developer: DeveloperReport;
};
