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

## Local setup
1. Copy `.env.example` to `.env.local` and add Firebase web + Admin credentials.
2. `npm install`
3. `npm run dev`
4. For a complete test without PageSpeed/NVIDIA keys, set `DEMO_AUDIT_MODE=true` both in Next.js env and Firebase Functions parameter configuration.
5. Install dependencies under `functions/` and deploy Firebase Functions when the Firebase project is ready.

## Firebase collections
`users`, `workspaces`, `workspaceMembers`, `branding`, `clients`, `audits`, `auditJobs`, `auditRuns`, `auditIssues`, `usage`.

The app does not invent business-impact percentages. AI output is explicitly instructed to avoid unsupported statistics, and template fallbacks are used if NVIDIA is unavailable.
