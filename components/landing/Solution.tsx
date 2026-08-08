'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Reveal from './Reveal';
import type { Strings } from '@/lib/language';

interface SolutionProps {
  t: Strings;
}

// One relevant image per step: 1. taking a photo (phone camera app open)
// 2. Zadoc analyzing skin (binary/data visual) 3. discovering the right
// oils (unchanged — bottles)
const IMAGES = [
  'https://images.unsplash.com/photo-1424798985931-3325521d26e6?w=560&h=700&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=560&h=700&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=560&h=700&fit=crop&q=80',
];

export default function Solution({ t }: SolutionProps) {
  const steps = [
    { title: t.solution.step1title, body: t.solution.step1body, image: IMAGES[0] },
    { title: t.solution.step2title, body: t.solution.step2body, image: IMAGES[1] },
    { title: t.solution.step3title, body: t.solution.step3body, image: IMAGES[2] },
  ];
  const track = [...steps, ...steps];

  return (
    <section className="overflow-hidden bg-white py-16 sm:py-24">
      <Reveal className="mx-auto mb-10 max-w-lg px-6 sm:mb-14 sm:px-10">
        <span className="text-sm font-medium uppercase tracking-wide text-zadoc-muted">
          {t.solution.eyebrow}
        </span>
        <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-zadoc-foreground sm:text-4xl">
          {t.solution.title}
        </h2>
      </Reveal>

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-24"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-24"
        />

        <motion.div
          className="no-scrollbar flex gap-5 overflow-x-auto px-6 sm:gap-6 sm:px-10"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 14, ease: 'linear', repeat: Infinity }}
        >
          {track.map((step, i) => (
            <div
              key={i}
              className="w-[230px] shrink-0 overflow-hidden rounded-card border border-zadoc-border shadow-card sm:w-[280px]"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={step.image}
                  alt={i < steps.length ? step.title : ''}
                  aria-hidden={i >= steps.length}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-zadoc-muted">
                  0{(i % steps.length) + 1}
                </span>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-zadoc-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zadoc-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}