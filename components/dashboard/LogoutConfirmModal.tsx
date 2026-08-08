'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface LogoutConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ open, onCancel, onConfirm }: LogoutConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <motion.div
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm log out"
            className="relative w-full max-w-xs rounded-zadoc border border-zadoc-border bg-white px-6 py-6 text-center shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <p className="text-base font-semibold mb-1">Log out?</p>
            <p className="text-sm text-zadoc-muted mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onCancel}
                className="rounded-full bg-zadoc-foreground px-4 py-3 text-sm font-semibold text-white"
              >
                No, stay logged in
              </button>
              <button
                onClick={onConfirm}
                className="rounded-full px-4 py-3 text-sm font-medium text-zadoc-muted hover:bg-black/5 transition-colors"
              >
                Yes, log out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
