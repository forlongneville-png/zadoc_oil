'use client';

import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import Logo from './Logo';
import type { Strings } from '@/lib/language';

interface FinalCtaProps {
  t: Strings;
  onGetStarted: () => void;
}

export default function FinalCta({ t, onGetStarted }: FinalCtaProps) {
  return (
    <section className="px-6 py-20 sm:px-10 sm:py-28">
      <Reveal className="mx-auto max-w-2xl rounded-card border border-zadoc-border bg-white px-8 py-14 text-center shadow-card sm:px-14 sm:py-16">
        <div className="mb-6 flex justify-center">
          <Logo variant="compact" size={40} />
        </div>
        <h2 className="text-[1.9rem] font-semibold leading-tight tracking-tight text-zadoc-foreground sm:text-4xl">
          {t.finalCta.title}
        </h2>
        <p className="mt-3 text-[1.05rem] text-zadoc-muted">{t.finalCta.subtext}</p>

        <button
          type="button"
          onClick={onGetStarted}
          className="mx-auto mt-8 inline-flex items-center gap-2 rounded-pill bg-zadoc-foreground px-7 py-4 text-[15px] font-medium text-zadoc-background transition-transform active:scale-[0.97]"
        >
          {t.finalCta.cta}
          <ArrowRight size={16} />
        </button>
      </Reveal>
    </section>
  );
}
