import Link from 'next/link';

const sections = [
  {
    title: 'What Scoryn provides',
    body: 'Scoryn helps users assess public websites and turn technical signals into website-audit reports. Depending on the enabled features, a report may include performance, SEO, accessibility, best-practice, link, metadata, and website-configuration findings, AI-assisted explanations, agency branding, PDF output, and shareable report links.'
  },
  {
    title: 'Your account',
    body: 'Provide accurate account information, keep your sign-in credentials secure, and use your own account. You are responsible for activity performed through your account and for maintaining access to the email address associated with it. Do not attempt to access another user’s workspace or reports without permission.'
  },
  {
    title: 'Authorized and fair use',
    body: 'Only submit websites you own or are authorized to test. Do not use Scoryn to attack a system, probe private networks, bypass access controls, overload a website, or submit credentials and secrets. Automated checks may be limited by fair-use controls, provider quotas, rate limits, or operational capacity. We may restrict activity that threatens service stability or violates these terms.'
  },
  {
    title: 'Plans, usage and payments',
    body: 'Available plan names, limits, and features are described on the Scoryn website and may change during beta. A displayed price or planned feature does not mean payment activation is available. Paid upgrades are not active unless the checkout flow explicitly confirms that they are enabled. We will present applicable payment and refund terms before enabling commercial billing.'
  },
  {
    title: 'Audit results are not guarantees',
    body: 'Audit results are snapshots produced by automated tools and third-party services. Scores and findings can vary by device, network, location, browser, page state, provider availability, and website changes. Scoryn does not guarantee a particular score, search ranking, conversion rate, security outcome, compliance status, or business result. Review findings and independently verify important recommendations before acting on them.'
  },
  {
    title: 'AI-generated explanations',
    body: 'AI-assisted explanations are intended to help interpret technical findings, not replace professional engineering, legal, accessibility, security, or business advice. They may be incomplete or incorrect. You are responsible for reviewing code changes and recommendations before applying them.'
  },
  {
    title: 'Reports and sharing',
    body: 'You are responsible for the URLs, client information, branding assets, and report content you submit or share. Anyone with access to a public report link may be able to view its contents. Check a report for confidential information before distributing it.'
  },
  {
    title: 'Availability and changes',
    body: 'Scoryn is currently a beta service. Features may be changed, interrupted, or removed while we improve reliability and security. We may suspend access when reasonably necessary to protect users, providers, or the service.'
  },
  {
    title: 'Contact',
    body: 'For questions or support requests, use the Scoryn feedback page at /feedback. A dedicated support email address has not yet been published.'
  }
];

export default function TermsPage() {
  return <main className="min-h-screen bg-black px-5 py-16 text-white sm:px-8">
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="text-xs text-zinc-500 transition hover:text-rose">← Back to Scoryn</Link>
      <h1 className="mt-10 font-heading text-4xl font-bold tracking-[-.04em] sm:text-5xl">Terms of Service</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-500">By accessing or using Scoryn, you agree to these terms. If you do not agree, do not use the service.</p>
      {sections.map((section) => <section key={section.title} className="mt-9">
        <h2 className="font-heading text-lg font-bold text-zinc-100">{section.title}</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-500">{section.body}</p>
      </section>)}
      <p className="mt-12 border-t border-white/[.06] pt-5 text-xs text-zinc-700">Last updated: October 10, 2026. These terms are specific to Scoryn’s current beta offering and should be reviewed before paid commercial launch.</p>
    </article>
  </main>;
}
