'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="absolute top-4 left-4 right-4 z-50 flex items-start gap-2 rounded-2xl bg-zadoc-foreground text-white px-4 py-3 shadow-card"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm leading-snug">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
