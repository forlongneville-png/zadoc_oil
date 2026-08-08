'use client';

import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface EmptyStateProps {
  onScan: () => void;
}

export default function EmptyState({ onScan }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-white border border-zadoc-border mb-6"
      >
        <Leaf size={36} strokeWidth={1.5} />
      </motion.div>
      <h1 className="text-xl font-semibold mb-2">Let&apos;s get to know your skin.</h1>
      <p className="text-sm text-zadoc-muted max-w-xs mb-8">
        Take a quick photo and Zadoc will create your skin profile.
      </p>
      <button
        onClick={onScan}
        className="rounded-full bg-zadoc-foreground px-7 py-3.5 text-sm font-semibold text-white"
      >
        Scan Your Face
      </button>
    </div>
  );
}
