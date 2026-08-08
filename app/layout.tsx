import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zadoc.online';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Zadoc — Know which oil suits your skin',
    template: '%s | Zadoc',
  },
  description:
    'Take a photo of your face and let Zadoc analyze your skin profile to discover which natural oils actually suit you — so you stop wasting money on products that are not right for you.',
  keywords: [
    'skincare oil finder',
    'which oil suits my skin',
    'skin analysis app',
    'natural oils for skin',
    'skin type quiz',
    'Cameroon skincare app',
    'Zadoc',
  ],
  applicationName: 'Zadoc',
  authors: [{ name: 'Terabyte' }],
  category: 'Beauty & Skincare',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Zadoc',
    title: 'Zadoc — Know which oil suits your skin',
    description:
      'Take a photo of your face and let Zadoc help you discover which natural oils fit your skin profile.',
    images: [{ url: '/logo/zadoc-logo.jpeg', width: 800, height: 800, alt: 'Zadoc' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zadoc — Know which oil suits your skin',
    description:
      'Take a photo of your face and let Zadoc help you discover which natural oils fit your skin profile.',
    images: ['/logo/zadoc-logo.jpeg'],
  },
  icons: {
    icon: [
      { url: '/logo/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/logo/favicon-192.png',
  },
};

// Mobile-first: lock pinch-zoom so the app feels native in-browser.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}