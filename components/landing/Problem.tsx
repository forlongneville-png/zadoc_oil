'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Reveal from './Reveal';
import type { Strings } from '@/lib/language';

interface ProblemProps {
  t: Strings;
}

// One relevant image per problem, in the same order as t.problem.items:
// 1. guesswork/too many choices  2. influencer-driven picks
// 3. expensive dermatologist     4. slow dermatologist booking
// 5. skin needs that keep changing
const IMAGES = [
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=560&h=700&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=560&h=700&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=560&h=700&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=560&h=700&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=560&h=700&fit=crop&q=80',
];

export default function Problem({ t }: ProblemProps) {
  const cards = t.problem.items.map((item, i) => ({ ...item, image: IMAGES[i] }));
  const track = [...cards, ...cards];

  return (
    <section className="overflow-hidden py-16 sm:py-24">
      <Reveal className="mx-auto mb-10 max-w-lg px-6 sm:mb-14 sm:px-10">
        <span className="text-sm font-medium uppercase tracking-wide text-zadoc-muted">
          {t.problem.eyebrow}
        </span>
        <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-zadoc-foreground sm:text-4xl">
          {t.problem.title}
        </h2>
      </Reveal>

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-zadoc-background to-transparent sm:w-24"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-zadoc-background to-transparent sm:w-24"
        />

        <motion.div
          className="no-scrollbar flex gap-5 overflow-x-auto px-6 sm:gap-6 sm:px-10"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
        >
          {track.map((card, i) => (
            <div
              key={i}
              className="w-[230px] shrink-0 overflow-hidden rounded-card border border-zadoc-border bg-white shadow-card sm:w-[280px]"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={card.image}
                  alt={i < cards.length ? card.title : ''}
                  aria-hidden={i >= cards.length}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
              <div className="p-5">
                <p className="text-[15px] font-medium leading-snug text-zadoc-foreground">
                  {card.title}
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-zadoc-foreground">
                    {card.stat}
                  </span>
                  <span className="text-xs text-zadoc-muted">{card.statLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}