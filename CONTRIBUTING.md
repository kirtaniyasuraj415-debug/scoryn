# Contributing to Scoryn

Thanks for your interest in Scoryn.

Scoryn is an early-stage website-audit product. Contributions, bug reports, documentation improvements, and practical audit-engine improvements are welcome.

## Before contributing

1. Read the README and understand the audit pipeline.
2. Do not commit API keys, Firebase service-account files, payment secrets, private keys, or personal credentials.
3. Use your own Firebase/API credentials for local development.
4. Keep audit results evidence-based. Do not add fabricated performance, SEO, revenue, ranking, or business-impact numbers.
5. Avoid changes that weaken authentication, authorization, Firestore rules, Storage rules, or server-side secret handling.

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

For the optional browser worker:

```bash
cd audit-worker
npm install
npm run audit
```

Use a test Firebase project and test credentials when possible.

## Pull requests

Please explain:

- what changed
- why it changed
- how you tested it
- any security or data-model implications

Small, focused pull requests are preferred.

## Reporting security issues

Please do not open a public issue for a suspected vulnerability. Follow the process in `SECURITY.md`.