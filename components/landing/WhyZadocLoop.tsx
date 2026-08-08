'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface WhyZadocLoopProps {
  bullets: string[];
  icon: LucideIcon;
}

export default function WhyZadocLoop({ bullets, icon: Icon }: WhyZadocLoopProps) {
  const track = [...bullets, ...bullets];

  return (
    <div className="relative mx-auto h-64 max-w-md overflow-hidden rounded-card border border-zadoc-border bg-zadoc-background shadow-card sm:h-72">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-zadoc-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-zadoc-background to-transparent"
      />

      <motion.div
        className="flex flex-col"
        animate={{ y: ['0%', '-50%'] }}
        transition={{ duration: 9, ease: 'linear', repeat: Infinity }}
      >
        {track.map((line, i) => (
          <div key={i} className="flex items-center gap-3 px-8 py-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zadoc-success/10">
              <Icon size={18} className="text-zadoc-success" strokeWidth={1.75} />
            </span>
            <p className="text-[1.05rem] font-medium leading-snug text-zadoc-foreground">{line}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}