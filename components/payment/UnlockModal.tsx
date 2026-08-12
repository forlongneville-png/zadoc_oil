// ROUTE: components/payment/UnlockModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, Loader2, CheckCircle2 } from 'lucide-react';

interface UnlockModalProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
  userId: string;
  onCheckoutReady: (checkoutUrl: string, paymentId: string) => void;
  onExempt: () => void;
}

const PRICE_LABEL = '129 FCFA';

export function UnlockModal({ open, onClose, profileId, userId, onCheckoutReady, onExempt }: UnlockModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, userId }),
      });
      if (!res.ok) throw new Error('Could not start payment');
      const data = await res.json();

      if (data.exempt) {
        setLoading(false);
        onExempt();
        return;
      }

      onCheckoutReady(data.checkoutUrl, data.payment.id);
    } catch {
      setError('Something went wrong starting your payment. Please try again.');
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="unlock-modal-title"
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-sheet border-t border-zadoc-border px-6 pt-6 pb-8 sm:max-w-md sm:mx-auto sm:left-0 sm:right-0"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-zadoc-border sm:hidden" />
            <button
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
              className="absolute right-5 top-5 text-zadoc-muted hover:text-zadoc-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zadoc-background border border-zadoc-border mb-5">
              <Droplet size={22} className="text-zadoc-foreground" />
            </div>

            <h2 id="unlock-modal-title" className="text-xl font-semibold mb-2">
              Unlock your complete oil guide
            </h2>
            <p className="text-sm text-zadoc-muted leading-relaxed mb-6">
              Get access to all recommended and avoid oils for this profile.
            </p>

            <div className="flex items-baseline justify-between mb-6 rounded-card border border-zadoc-border px-5 py-4">
              <span className="text-sm text-zadoc-muted">One-time unlock</span>
              <span className="text-lg font-semibold">{PRICE_LABEL}</span>
            </div>

            {error && <p className="text-sm text-zadoc-avoid mb-4">{error}</p>}

            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full rounded-full bg-zadoc-foreground text-white py-3.5 font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Starting payment…
                </>
              ) : (
                'Continue to payment'
              )}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function UnlockedBanner() {
  return (
    <div className="zadoc-card flex items-center gap-3">
      <CheckCircle2 size={22} className="text-zadoc-success" />
      <div>
        <p className="font-medium">Unlocked</p>
        <p className="text-sm text-zadoc-muted">Your complete oil guide is ready.</p>
      </div>
    </div>
  );
}