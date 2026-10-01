import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scoryn — Branded Website Audits',
  description: 'Audit client websites, explain issues clearly, and send branded sales-ready reports.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
