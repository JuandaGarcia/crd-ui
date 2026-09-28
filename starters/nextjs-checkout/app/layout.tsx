import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import 'crd-ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Checkout · crd-ui + Next.js',
  description: 'A payment form with a live credit card preview, built with crd-ui.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
