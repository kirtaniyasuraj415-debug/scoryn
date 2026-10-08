import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scoryn — AI Website Audits & Client-Ready Reports',
  description: 'Scoryn turns website performance, SEO, accessibility, and technical findings into clear, actionable, branded reports for agencies, freelancers, and business teams.',
  metadataBase: new URL('https://scoryn-eight.vercel.app')
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
