// APP: zadoc.online
// ROUTE: app/page.tsx  (landing page — GET /)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/landing/Hero';
import PhotoShowcase from '@/components/landing/PhotoShowcase';
import Problem from '@/components/landing/Problem';
import Solution from '@/components/landing/Solution';
import WhyZadoc from '@/components/landing/WhyZadoc';
import FinalCta from '@/components/landing/FinalCta';
import Footer from '@/components/landing/Footer';
import AuthSheet from '@/components/auth/AuthSheet';
import Logo from '@/components/landing/Logo';
import { resolveLanguage, strings, type Lang } from '@/lib/language';
import type { ZadocUser } from '@/types/zadoc';

// Structured data for search engines *and* AI answer engines (ChatGPT
// Search, Perplexity, Google AI Overviews, etc). Kept static/English —
// see the SEO notes for why per-locale JSON-LD isn't wired in yet.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://zadoc.online/#organization',
      name: 'Zadoc',
      url: 'https://zadoc.online',
      logo: 'https://zadoc.online/logo/favicon-192.png',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Zadoc',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      description:
        'Zadoc analyzes a photo of your face to build a skin profile and recommend which natural oils actually suit your skin — so you stop guessing and stop wasting money.',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'XAF',
        price: '129',
      },
      url: 'https://zadoc.online',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does Zadoc know which oil suits my skin?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You take one photo of your face. Zadoc analyzes it to build a skin profile — type and condition — and matches that profile against oils known to help or to avoid.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Zadoc a replacement for a dermatologist?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Zadoc is a fast, low-cost first step for everyday oil selection. It is not a medical diagnosis — for skin conditions that need treatment, see a licensed dermatologist.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does Zadoc cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Unlocking a full skin profile costs a small, one-time fee, paid by mobile money.',
          },
        },
      ],
    },
  ],
};

// Boot sequence for the root route, in order:
//   1. Check for an active session (/api/auth/me).
//      -> If logged in: redirect to /dashboard. Nothing else ever renders.
//      -> If not logged in: fall through to step 2.
//   2. Resolve the visitor's language.
//   3. Render the landing page.
// Nothing (not the Hero, not the pitch) paints until step 1 has answered,
// so a returning logged-in visitor never sees the marketing page at all —
// not even for a frame.
type BootState = { status: 'checking' } | { status: 'redirecting' } | { status: 'ready'; lang: Lang };

export default function Home() {
  const router = useRouter();
  const [boot, setBoot] = useState<BootState>({ status: 'checking' });
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { user: ZadocUser | null }) => {
        if (cancelled) return;
        if (data.user) {
          setBoot({ status: 'redirecting' });
          router.replace('/dashboard');
        } else {
          setBoot({ status: 'ready', lang: resolveLanguage() });
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Session check failed (offline, API hiccup, etc.) — treat as
        // logged-out rather than getting stuck on the loading screen.
        setBoot({ status: 'ready', lang: resolveLanguage() });
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Loading / redirecting state — logo subtly scales/fades, nothing more
  // elaborate, per brand guidance. Covers both "still checking the
  // session" and "found a session, waiting for the redirect to land".
  if (boot.status !== 'ready') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zadoc-background">
        <div className="animate-fade-scale">
          <Logo variant="compact" size={44} />
        </div>
      </div>
    );
  }

  const t = strings[boot.lang];

  return (
    <main className="min-h-screen bg-zadoc-background">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <Hero t={t} onGetStarted={() => setSheetOpen(true)} />
      <PhotoShowcase t={t} />
      <Problem t={t} />
      <Solution t={t} />
      <WhyZadoc t={t} />
      <FinalCta t={t} onGetStarted={() => setSheetOpen(true)} />
      <Footer t={t} />

      <AuthSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAuthenticated={() => {
          setSheetOpen(false);
          router.push('/dashboard');
        }}
      />
    </main>
  );
}