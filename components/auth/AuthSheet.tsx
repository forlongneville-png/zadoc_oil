'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import type { ZadocUser } from '@/types/zadoc';

type Tab = 'login' | 'signup';

interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (user: ZadocUser) => void;
  initialTab?: Tab;
}

export default function AuthSheet({ open, onClose, onAuthenticated, initialTab = 'signup' }: AuthSheetProps) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-md rounded-t-sheet bg-white"
            style={{ borderTop: '1px solid var(--zadoc-border)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) {
                onClose();
              }
            }}
          >
            <div className="flex justify-center pt-3">
              <div className="h-1.5 w-10 rounded-full" style={{ background: 'var(--zadoc-border)' }} />
            </div>

            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-zadoc-muted hover:bg-zadoc-background"
            >
              <X size={20} />
            </button>

            <div className="px-6 pb-8 pt-4">
              <div className="mb-6 flex gap-1 rounded-xl bg-zadoc-background p-1">
                <TabButton active={tab === 'login'} onClick={() => setTab('login')}>
                  Log in
                </TabButton>
                <TabButton active={tab === 'signup'} onClick={() => setTab('signup')}>
                  Create account
                </TabButton>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === 'signup' ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tab === 'signup' ? -16 : 16 }}
                  transition={{ duration: 0.18 }}
                >
                  {tab === 'login' ? (
                    <LoginForm onSuccess={onAuthenticated} />
                  ) : (
                    <SignupForm onSuccess={onAuthenticated} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
        active ? 'bg-white text-zadoc-foreground shadow-sm' : 'text-zadoc-muted'
      }`}
    >
      {children}
    </button>
  );
}
