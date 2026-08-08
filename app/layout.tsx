import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zadoc — Know which oil suits your skin',
  description:
    'Take a photo of your face and let Zadoc help you discover oils that fit your skin profile.',
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
