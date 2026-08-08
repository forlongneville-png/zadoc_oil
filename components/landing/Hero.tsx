'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Camera } from 'lucide-react';
import Logo from './Logo';
import type { Strings } from '@/lib/language';

interface HeroProps {
  t: Strings;
  onGetStarted: () => void;
}

export default function Hero({ t, onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-14 pt-8 sm:px-10 sm:pt-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 flex items-center justify-between sm:mb-20">
          <Logo variant="full" size={30} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 max-w-xl sm:mb-14"
        ><h1 className="text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-zadoc-foreground sm:text-6xl">
            {t.hero.headlinePrefix}{' '}
            <span className="hero-highlight-gradient">{t.hero.headlineHighlight}</span>
          </h1>
          <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-zadoc-muted sm:text-lg">
            {t.hero.subtext}
          </p>

          <button
            type="button"
            onClick={onGetStarted}
            className="mt-8 inline-flex items-center gap-2 rounded-pill bg-zadoc-foreground px-7 py-4 text-[15px] font-medium text-zadoc-background transition-transform active:scale-[0.97]"
          >
            <Camera size={17} />
            {t.hero.cta}
            <ArrowRight size={16} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-zadoc-border shadow-card sm:aspect-[21/9]"
        >
          <Image
            src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&h=900&fit=crop&q=80"
            alt="Close-up of natural skincare oil being applied to skin"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 1024px"
          />
        </motion.div>
      </div>
    </section>
  );
}