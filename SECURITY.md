# Security Policy

## Supported version

Scoryn is an early-stage project under active development. The `main` branch is the primary supported development version.

## Reporting a vulnerability

Please do **not** publish credentials, private keys, exploit details, or other sensitive information in a public GitHub issue.

If you discover a security problem, contact the project maintainer privately through the contact method listed on the maintainer's current public profile or project website. Include:

- a short description of the issue
- the affected file or endpoint, if known
- reproduction steps that do not expose real user data or credentials
- the potential impact

Please allow reasonable time for investigation and remediation before public disclosure.

## Security expectations for contributors

Never commit:

- `.env` or `.env.local` files
- Firebase service-account JSON
- Firebase private keys
- NVIDIA, PageSpeed, Razorpay, GitHub, or other API tokens
- webhook secrets
- passwords or session secrets

Scoryn's audit workers process user-supplied URLs. Changes to URL fetching, crawling, browser automation, redirects, or server-side HTTP requests should be reviewed specifically for SSRF, internal-network access, resource exhaustion, and unsafe redirect behavior.

Firestore and Storage rules are part of the application's security boundary. Treat rule changes as security-sensitive.

## If a secret was exposed

Rotate/revoke the affected credential immediately. Removing a secret from the latest commit is not enough if it existed in Git history or was already copied by another party.