'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ScanOverlayProps {
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  showBack: boolean;
}

export default function ScanOverlay({ children, onClose, onBack, showBack }: ScanOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-6"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md h-[92vh] sm:h-[85vh] bg-zadoc-background rounded-t-[2rem] sm:rounded-[2rem] shadow-card border border-zadoc-border overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          {showBack ? (
            <button
              onClick={onBack}
              aria-label="Back"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <span className="w-9 h-9" />
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto zadoc-scrollbar-none px-6 pb-6 flex flex-col">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
