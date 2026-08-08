'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import Solution from '@/components/landing/Solution';
import WhyZadoc from '@/components/landing/WhyZadoc';
import SocialProof from '@/components/landing/SocialProof';
import FinalCta from '@/components/landing/FinalCta';
import Footer from '@/components/landing/Footer';
import AuthSheet from '@/components/auth/AuthSheet';
import Logo from '@/components/landing/Logo';
import { resolveLanguage, strings, type Lang } from '@/lib/language';
import type { ZadocUser } from '@/types/zadoc';

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setLang(resolveLanguage());
  }, []);

  // If already logged in, skip the landing pitch and go straight to the
  // dashboard (mirrors Piece 2's original "already authenticated" redirect,
  // now backed by the real /api/auth/me session check).
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { user: ZadocUser | null }) => {
        if (data.user) router.replace('/dashboard');
      })
      .catch(() => {});
  }, [router]);

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
      <Hero t={t} onGetStarted={() => setSheetOpen(true)} />
      <Problem t={t} />
      <Solution t={t} />
      <WhyZadoc t={t} />
      <SocialProof t={t} />
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
