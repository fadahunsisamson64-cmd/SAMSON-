import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lumina | Premium Online Booking Platform',
  description: 'Book trusted services easily with Lumina. A premium multi-business platform for verified service providers and customers.',
  openGraph: {
    title: 'Lumina | Premium Online Booking Platform',
    description: 'Book trusted services easily with Lumina. A premium multi-business platform for verified service providers and customers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumina | Premium Online Booking Platform',
    description: 'Book trusted services easily with Lumina. A premium multi-business platform for verified service providers and customers.',
  },
};

import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
