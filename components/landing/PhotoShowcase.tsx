'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Reveal from './Reveal';
import type { Strings } from '@/lib/language';

interface PhotoShowcaseProps {
  t: Strings;
}

// 7 related images that slide continuously — swap these for real product /
// skin-analysis photography whenever you have it.
const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=650&fit=crop&q=80', alt: 'Natural oil being applied to skin' },
  { src: 'https://images.unsplash.com/photo-1747303969063-3b90bcb3942e?w=500&h=650&fit=crop&q=80', alt: 'Skincare serum being poured from a dropper bottle' },
  { src: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=650&fit=crop&q=80', alt: 'Several skincare oil bottles lined up' },
  { src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&h=650&fit=crop&crop=faces&q=80', alt: 'Woman with clear, healthy skin' },
  { src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=650&fit=crop&crop=faces&q=80', alt: 'Woman with a glowing skincare routine' },
  { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=650&fit=crop&crop=faces&q=80', alt: 'Close-up of healthy facial skin' },
  { src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=650&fit=crop&crop=faces&q=80', alt: 'Person with a skincare oil routine' },
];

export default function PhotoShowcase({ t }: PhotoShowcaseProps) {
  const track = [...IMAGES, ...IMAGES];

  return (
    <section className="overflow-hidden py-16 sm:py-24">
      <Reveal className="mx-auto mb-10 max-w-xl px-6 text-center sm:mb-14">
        <h2 className="text-[1.9rem] font-semibold leading-tight tracking-tight text-zadoc-foreground sm:text-4xl">
          {t.showcase.question}
        </h2>
      </Reveal>

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-zadoc-background to-transparent sm:w-32"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-zadoc-background to-transparent sm:w-32"
        />

        <motion.div
          className="flex gap-4 sm:gap-6"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
        >
          {track.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[3/4] w-[150px] shrink-0 overflow-hidden rounded-card border border-zadoc-border shadow-card sm:w-[220px]"
            >
              <Image
                src={img.src}
                alt={i < IMAGES.length ? img.alt : ''}
                aria-hidden={i >= IMAGES.length}
                fill
                className="object-cover"
                sizes="220px"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}