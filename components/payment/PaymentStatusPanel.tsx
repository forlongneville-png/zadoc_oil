'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { PaymentStatus } from '@/types/zadoc';

interface PaymentStatusPanelProps {
  paymentId: string;
  onUnlocked: () => void;
  onDismiss: () => void;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10; // bounded retries — the webhook is the real source of truth, this is just a UI fallback

export function PaymentStatusPanel({ paymentId, onUnlocked, onDismiss }: PaymentStatusPanelProps) {
  const [status, setStatus] = useState<PaymentStatus>('created');
  const [gaveUp, setGaveUp] = useState(false);
  const pollCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`/api/payments/status/${paymentId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setStatus(data.payment.status);
        if (data.payment.status === 'successful' && data.isUnlocked) {
          onUnlocked();
          return;
        }
        if (data.payment.status === 'failed' || data.payment.status === 'expired') {
          return; // stop polling, show terminal state
        }
        pollCountRef.current += 1;
        if (pollCountRef.current >= MAX_POLLS) {
          setGaveUp(true);
        } else {
          timerRef.current = setTimeout(check, POLL_INTERVAL_MS);
        }
      } catch {
        // network hiccup — let the bounded retry loop keep going
      }
    }

    check();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  if (status === 'failed') {
    return (
      <div className="zadoc-card flex flex-col items-center text-center gap-3">
        <XCircle size={32} className="text-zadoc-avoid" />
        <p className="font-medium">Payment failed</p>
        <p className="text-sm text-zadoc-muted">The payment wasn&apos;t completed. You can try again.</p>
        <button
          onClick={onDismiss}
          className="mt-2 rounded-full border border-zadoc-border px-5 py-2 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="zadoc-card flex flex-col items-center text-center gap-3">
        <Clock size={32} className="text-zadoc-muted" />
        <p className="font-medium">Payment link expired</p>
        <p className="text-sm text-zadoc-muted">Start a new payment to unlock your oil guide.</p>
        <button
          onClick={onDismiss}
          className="mt-2 rounded-full border border-zadoc-border px-5 py-2 text-sm font-medium"
        >
          Start over
        </button>
      </div>
    );
  }

  if (gaveUp) {
    return (
      <div className="zadoc-card flex flex-col items-center text-center gap-3">
        <Clock size={32} className="text-zadoc-muted" />
        <p className="font-medium">Still confirming…</p>
        <p className="text-sm text-zadoc-muted">
          This is taking longer than usual. Your payment will unlock automatically once confirmed —
          feel free to check back shortly.
        </p>
        <button
          onClick={onDismiss}
          className="mt-2 rounded-full border border-zadoc-border px-5 py-2 text-sm font-medium"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="zadoc-card flex flex-col items-center text-center gap-3">
      <Loader2 size={32} className="animate-spin text-zadoc-foreground" />
      <p className="font-medium">Verifying your payment…</p>
      <p className="text-sm text-zadoc-muted">This usually takes a few seconds.</p>
    </div>
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
