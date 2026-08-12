// ROUTE: app/page.tsx
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

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setLang(resolveLanguage());
  }, []);

  // If already logged in, skip the landing pitch and go straight to the
  // dashboard, backed by the real /api/auth/me session check.
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { user: ZadocUser | null }) => {
        if (data.user) router.replace('/dashboard');
      })
      .catch(() => {});
  }, [router]);

  // Referral capture: if someone lands with ?ref=CODE123, remember it in a
  // cookie so /api/auth/signup can read it later and report it to Admin.
  // Zadoc never does anything else with this value — no lookup, no
  // commission math, just "remember the code, forward it once at signup."
  // First code wins for a given visit — we don't overwrite an existing
  // cookie, so a later, unrelated ?ref= link can't hijack an earlier one.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;

    const hasExisting = document.cookie.split('; ').some((c) => c.startsWith('zadoc_ref='));
    if (hasExisting) return;

    const THIRTY_DAYS = 60 * 60 * 24 * 30;
    document.cookie = `zadoc_ref=${encodeURIComponent(ref)}; path=/; max-age=${THIRTY_DAYS}; SameSite=Lax`;
  }, []);

  // Brief loading state while language resolves client-side — logo
  // subtly scales/fades, nothing more elaborate, per brand guidance.
  if (!lang) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zadoc-background">
        <div className="animate-fade-scale">
          <Logo variant="compact" size={44} />
        </div>
      </div>
    );
  }

  const t = strings[lang];

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