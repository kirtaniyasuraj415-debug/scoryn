# Scoryn

**Scoryn is an AI-powered website audit and reporting platform for agencies, freelancers, developers, and business teams.**

It turns a public website URL into a normalized audit dataset and reusable client reports. The same audit data powers the business-owner report, developer report, public share page, and audit history, so the site is not unnecessarily scanned twice for different report views.

> **Project status:** Live beta — actively tested and improved with real audit workflows.

## What Scoryn does

Scoryn turns technical website signals into clear, actionable, client-ready reports. It is built for teams that need to audit websites, explain what matters to the business, apply their own branding, and share professional deliverables without repeating the same scan.

Core workflow:

1. Enter a public website URL.
2. Collect performance and technical website signals.
3. Normalize the findings into one audit dataset.
4. Explain issues with AI when the AI provider is available.
5. Generate client-facing and developer-facing reports.
6. Export a branded PDF and/or share a public report.
7. Keep audit history and workspace/client data in Firebase.

## Audit coverage

The Vercel audit path combines several sources of website signals:

- Google PageSpeed Insights / Lighthouse performance data
- Mobile and desktop performance analysis
- Bounded sitemap and internal-link discovery
- HTML SEO and accessibility checks
- Broken-link checks
- HTTPS and redirect signals
- Security-header signals
- robots.txt and sitemap signals
- Cookie/configuration signals

For signals that cannot be reliably verified, Scoryn keeps the value unavailable instead of inventing a result.

### Browser-heavy audits

Scoryn also includes an optional GitHub Actions browser-audit worker for deeper multi-page scanning.

The worker uses:

- Unlighthouse 0.19.x for crawling/Lighthouse reports
- Playwright + axe-core 4.13 for accessibility/WCAG findings

The worker is optional. The Vercel path has a Firebase-worker fallback when the GitHub Actions dispatch is unavailable.

## AI analysis

Scoryn currently uses the NVIDIA API for AI-powered issue explanations, with deterministic template fallbacks when AI is unavailable.

The AI layer is designed to:

- explain technical findings in understandable language
- connect findings to practical business impact without inventing unsupported statistics
- provide actionable recommendations

Scoryn does **not** claim that AI-generated business-impact percentages are measured facts. Unsupported statistics are deliberately avoided.

## Reports and sharing

Scoryn uses the same normalized audit dataset across:

- Business Owner reports
- Developer reports
- Public share pages
- Audit history

Branded PDF reports are generated with `@react-pdf/renderer`.

## Data and backend

Scoryn uses Firebase for application data and authentication.

Main collections include:

- `users`
- `workspaces`
- `workspaceMembers`
- `branding`
- `clients`
- `audits`
- `auditJobs`
- `auditRuns`
- `auditIssues`
- `usage`

## Tech stack

- **Next.js 15** + App Router
- **React 19** + TypeScript
- **Tailwind CSS**
- **Firebase Authentication**
- **Cloud Firestore**
- **Firebase Storage**
- **Firebase Cloud Functions**
- **Google PageSpeed Insights API**
- **NVIDIA API** for AI explanations
- **Playwright + axe-core** for browser-based accessibility auditing
- **Unlighthouse** for optional crawling/Lighthouse worker
- **@react-pdf/renderer** for PDF reports
- **Razorpay** integration hooks (test mode)

## Local development

### Requirements

- Node.js
- npm
- A Firebase project for full application functionality

### Setup

```bash
git clone https://github.com/kirtaniyasuraj415-debug/scoryn.git
cd scoryn
npm install
cp .env.example .env.local
npm run dev
```

Then open the local Next.js development server.

### Environment variables

See `.env.example` for the complete configuration.

The project supports:

- Firebase Web SDK credentials
- Firebase Admin credentials
- PageSpeed API key
- NVIDIA API credentials
- Razorpay test-mode credentials
- Optional GitHub Actions audit-worker configuration

**Never commit real API keys, Firebase private keys, service-account JSON, or payment secrets.**

### Demo mode

For local/full-flow testing before real external API credentials are available:

```env
DEMO_AUDIT_MODE=true
```

Configure this for both the Next.js environment and Firebase Functions parameter configuration where required.

## Architecture

At a high level:

```text
Public website URL
       |
       v
Scoryn audit pipeline
       |
       +--> PageSpeed / Lighthouse
       +--> SEO & accessibility checks
       +--> Link / HTTP / configuration checks
       +--> Optional browser-heavy worker
       |
       v
Normalized audit dataset
       |
       +--> AI explanations
       +--> Business Owner report
       +--> Developer report
       +--> Public share page
       +--> Branded PDF
       +--> Audit history
```

## Why the normalized dataset matters

A key architectural rule in Scoryn is that an audit produces **one normalized dataset**.

Different report types and views consume that same dataset. This avoids running the same website scan again just because the user wants a different report format.

## Repository status

Scoryn's source repository is public and intended for developer inspection, learning, experimentation, and contribution. Production configuration and external service credentials remain environment-specific and must never be committed.

Before running your own deployment, review:

- Firebase security rules
- environment variables and secret storage
- GitHub Actions secrets
- authentication configuration
- payment configuration
- private service endpoints
- dependency and third-party license requirements

The repository includes an MIT license. The license applies to Scoryn's project code; third-party dependencies and services remain subject to their own licenses and terms.

## Contributing and security

Contributions are welcome. See `CONTRIBUTING.md` for development and pull-request guidance. Security issues should be reported privately according to `SECURITY.md` rather than posted publicly.

## Roadmap

Scoryn is in live beta. Planned work may include:

- deeper audit coverage
- stronger multi-page crawling
- richer client reporting
- additional AI providers
- improved workspace/client workflows
- production billing
- additional integrations

The roadmap may change as the product is tested and developed.

## Live demo

**https://scoryn-eight.vercel.app**

---

Built as an independent developer project by **Suraj Kirtaniya**.
