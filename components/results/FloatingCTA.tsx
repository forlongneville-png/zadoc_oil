'use client';

import { motion } from 'framer-motion';

export function FloatingCTA({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-5"
    >
      <button
        onClick={onClick}
        className="w-full max-w-md rounded-full bg-zadoc-foreground px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform active:scale-[0.98]"
      >
        🔒 Access all — 129 FCFA
      </button>
    </motion.div>
  );
}
