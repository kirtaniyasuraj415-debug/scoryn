import type { Metadata } from 'next';
import './globals.css';
import { BetaBanner } from '@/components/beta-banner';

export const metadata: Metadata = {
  title: 'Scoryn — Branded Website Audits',
  description: 'Audit client websites, turn technical findings into clear business reports, and share professional deliverables.'
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body><BetaBanner />{children}</body></html>;
}
