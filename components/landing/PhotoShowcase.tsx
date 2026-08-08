'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Reveal from './Reveal';
import type { Strings } from '@/lib/language';

interface PhotoShowcaseProps {
  t: Strings;
}

// 7 oil-only images that slide continuously — every shot here is a bottle,
// dropper, or the oil itself, never a face or generic skincare-routine
// photo, so the row stays strictly on-topic with "what oil fits your skin".
const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=500&h=650&fit=crop&q=80', alt: 'Person holding an oil dropper' },
  { src: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&h=650&fit=crop&q=80', alt: 'Person holding an amber glass oil bottle' },
  { src: 'https://images.unsplash.com/photo-1633423411797-9a7317784d2b?w=500&h=650&fit=crop&q=80', alt: 'Dropper bottle filled with facial oil' },
  { src: 'https://images.unsplash.com/photo-1608571424266-edeb9bbefdec?w=500&h=650&fit=crop&q=80', alt: 'Brown glass oil bottle on a table' },
  { src: 'https://images.unsplash.com/photo-1699373383910-6f9cf75ee50a?w=500&h=650&fit=crop&q=80', alt: 'Oil bottle next to a tube of oil' },
  { src: 'https://images.unsplash.com/photo-1621958180356-7a955e56525c?w=500&h=650&fit=crop&q=80', alt: 'Yellow and white glass oil bottle' },
  { src: 'https://images.unsplash.com/photo-1573575155376-b5010099301b?w=500&h=650&fit=crop&q=80', alt: 'Person holding a small clear oil dropper bottle' },
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

        {/* no-scrollbar keeps the row usable by drag/swipe/trackpad while the
            automatic marquee animation still runs underneath */}
        <motion.div
          className="no-scrollbar flex gap-4 overflow-x-auto sm:gap-6"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 16, ease: 'linear', repeat: Infinity }}
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