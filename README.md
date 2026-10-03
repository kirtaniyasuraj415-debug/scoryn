# Scoryn

Scoryn is a Firebase-backed SaaS for branded website audit reports.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style components
- Firebase Auth, Firestore, Storage, Cloud Functions
- Google PageSpeed Insights API
- NVIDIA API for issue explanations, with deterministic fallback templates
- @react-pdf/renderer for branded PDF
- Razorpay test-mode integration hooks

## Audit architecture

Every audit produces one normalized dataset. The Business Owner and Developer
reports, both PDFs, the public share page and history all read that same data;
the site is never scanned twice for the two report modes.

The Vercel path uses PageSpeed/Lighthouse as the performance source and adds
bounded sitemap/internal-link discovery, HTML SEO/accessibility checks, broken
link checks and Web Check-compatible HTTPS, redirect, security-header, robots,
sitemap and cookie signals. Values that a scanner cannot verify remain null or
"Not reported".

Browser-heavy multi-page scans are available through
`.github/workflows/scoryn-audit-worker.yml`. When `AUDIT_WORKER_MODE=github-actions`
and a GitHub token is configured, `/api/audit/start` dispatches that worker; if
dispatch fails, it creates a Firebase-worker fallback job. The worker uses
Unlighthouse 0.19.x (MIT) for crawling/Lighthouse reports and axe-core 4.13
(MPL-2.0) through Playwright for WCAG findings. Web Check is MIT licensed but is
not published as a reusable npm package, so Scoryn uses a small adapter for its
relevant HTTP/configuration signals rather than copying its UI.

## Local setup
1. Copy `.env.example` to `.env.local` and add Firebase web + Admin credentials.
2. `npm install`
3. `npm run dev`
4. For a complete test without PageSpeed/NVIDIA keys, set `DEMO_AUDIT_MODE=true` both in Next.js env and Firebase Functions parameter configuration.
5. Install dependencies under `functions/` and deploy Firebase Functions when the Firebase project is ready.

## Firebase collections
`users`, `workspaces`, `workspaceMembers`, `branding`, `clients`, `audits`, `auditJobs`, `auditRuns`, `auditIssues`, `usage`.

The app does not invent business-impact percentages. AI output is explicitly instructed to avoid unsupported statistics, and template fallbacks are used if NVIDIA is unavailable.
