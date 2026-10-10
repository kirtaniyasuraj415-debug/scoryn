import Link from 'next/link';

const sections = [
  {
    title: 'Information Scoryn processes',
    body: 'When you create an account, Scoryn processes your account email and, if provided, your display name. When you run an audit, we process the website URL you submit and the technical findings returned by the audit workflow. If you configure a workspace, we may store agency or business name, logo, brand colors, contact details, client labels, report preferences, and other information you choose to provide.'
  },
  {
    title: 'How we use information',
    body: 'We use this information to authenticate you, create and manage your workspace, run website audits, generate explanations and reports, save audit history, apply your branding, share reports when you request it, respond to support requests, prevent abuse, troubleshoot failures, and protect the service. Do not submit passwords, private access tokens, or other secrets as audit inputs.'
  },
  {
    title: 'Website audit data',
    body: 'An audit URL is sent to the services needed to inspect that public website. Audit results can include performance measurements, SEO and accessibility findings, page metadata, URLs discovered during crawling, and technical configuration signals. Only submit websites you own or are authorized to assess. A public report link may expose the report contents to anyone who has that link; review its contents before sharing it.'
  },
  {
    title: 'Third-party providers',
    body: 'Scoryn uses Firebase services for authentication and data storage where configured, Google PageSpeed Insights to obtain Lighthouse-based audit signals, and an AI provider such as NVIDIA to help explain findings when that feature is enabled. Hosting and delivery are provided by Vercel. These providers receive only the data needed for their relevant function and process it under their own terms and privacy policies. Provider availability and integrations may change as the beta evolves.'
  },
  {
    title: 'Retention, access and deletion',
    body: 'Workspace information and saved reports may remain in your account until you delete them or request deletion. You can request account or data deletion, or ask a question about information associated with your account, through the Report a Bug / Feedback page. We may retain limited records where needed for security, fraud prevention, legal compliance, or resolving disputes. Deleting a report may not remove copies that another person has already downloaded or saved from a public share link.'
  },
  {
    title: 'Security and beta status',
    body: 'We use access controls and server-side handling for sensitive service credentials, but no online service can promise absolute security. Scoryn is in beta, so features, providers, and data-handling practices may evolve. We will update this policy when material changes are made.'
  },
  {
    title: 'Contact',
    body: 'For privacy requests or questions, use the Scoryn feedback page at /feedback. A dedicated support email address has not yet been published; we will not list an unverified email address here.'
  }
];

export default function PrivacyPage() {
  return <main className="min-h-screen bg-black px-5 py-16 text-white sm:px-8">
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="text-xs text-zinc-500 transition hover:text-rose">← Back to Scoryn</Link>
      <h1 className="mt-10 font-heading text-4xl font-bold tracking-[-.04em] sm:text-5xl">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-500">This policy describes how Scoryn handles information when you use its website-audit, reporting, and workspace features.</p>
      {sections.map((section) => <section key={section.title} className="mt-9">
        <h2 className="font-heading text-lg font-bold text-zinc-100">{section.title}</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-500">{section.body}</p>
      </section>)}
      <p className="mt-12 border-t border-white/[.06] pt-5 text-xs text-zinc-700">Last updated: October 10, 2026. Scoryn is a beta service; this policy should be reviewed as features and providers change.</p>
    </article>
  </main>;
}
