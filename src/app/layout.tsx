import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.scoryn.in'),
  title: {
    default: 'Scoryn — AI Website Audits & Client-Ready Reports',
    template: '%s — Scoryn'
  },
  description: 'Scoryn turns website performance, SEO, accessibility, and technical findings into clear, actionable, branded reports for agencies, freelancers, and business teams.',
  keywords: [
    'website audit tool',
    'AI website audit',
    'client report generator',
    'white-label audit reports',
    'PageSpeed report tool',
    'agency audit software',
    'website performance audit'
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://www.scoryn.in',
    siteName: 'Scoryn',
    title: 'Scoryn — AI Website Audits & Client-Ready Reports',
    description: 'AI-powered website audits that turn PageSpeed data into client-ready branded reports for agencies and freelancers.',
    locale: 'en_IN'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scoryn — AI Website Audits & Client-Ready Reports',
    description: 'AI-powered website audits with client-ready branded reports.'
  },
  robots: { index: true, follow: true }
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Scoryn',
  url: 'https://www.scoryn.in',
  description: 'AI-powered website audit tool that converts PageSpeed data into client-ready branded reports for agencies and freelancers.',
  founder: { '@type': 'Person', name: 'Suraj Kirtaniya' }
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
