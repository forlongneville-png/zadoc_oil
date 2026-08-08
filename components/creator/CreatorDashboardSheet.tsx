'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MousePointerClick, Users, CreditCard, Coins, Copy, Share2, MessageCircle } from 'lucide-react';

interface DashboardData {
  creator: { referral_code: string; commission_rate: number; status: string };
  name: string;
  clicks: number;
  signups: number;
  paid_users: number;
  earnings: { available: number; pending: number; paid: number; total: number };
  referral_link: string;
}

const WHATSAPP_URL =
  'https://wa.me/237683473299?text=Hello%20Zadoc%20support%2C%20I%20am%20a%20Zadoc%20creator%20and%20I%20need%20assistance%20with%20my%20creator%20account.';

function isWithdrawWindow(date = new Date()) {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}

export function CreatorDashboardSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const withdrawOpen = isWithdrawWindow();

  useEffect(() => {
    if (!open) return;
    fetch('/api/creator/dashboard').then((r) => r.json()).then(setData).catch(() => setData(null));
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function copyLink() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.referral_link);
      setToast('Referral link copied.');
    } catch {
      setToast('Could not copy link.');
    }
  }

  async function shareLink() {
    if (!data) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Zadoc', text: 'Try Zadoc — personalized skincare oils.', url: data.referral_link });
      } catch {
        /* user cancelled share — no-op */
      }
    } else {
      copyLink();
    }
  }

  function handleWithdraw() {
    if (!isWithdrawWindow()) {
      setToast('Withdrawals are available Saturdays and Sundays.');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-2xl flex-col rounded-t-zadoc border border-zadoc-border bg-white shadow-xl"
            style={{ height: '90vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-zadoc-border px-6 py-4">
              <p className="text-lg font-semibold text-zadoc-foreground">Creator Dashboard</p>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-zadoc-background" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto zadoc-scrollbar px-6 py-5">
              {!data ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-zadoc-sm bg-zadoc-border/40" />)}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Link clicks', value: data.clicks.toLocaleString(), icon: MousePointerClick },
                      { label: 'Signups', value: data.signups.toLocaleString(), icon: Users },
                      { label: 'Paid users', value: data.paid_users.toLocaleString(), icon: CreditCard },
                      { label: 'Earnings', value: `${data.earnings.total.toLocaleString()} FCFA`, icon: Coins },
                    ].map((m) => (
                      <div key={m.label} className="rounded-zadoc-sm border border-zadoc-border p-4">
                        <m.icon className="mb-2 h-4 w-4 text-zadoc-muted" />
                        <p className="text-xs text-zadoc-muted">{m.label}</p>
                        <p className="mt-1 text-lg font-semibold tabular-nums text-zadoc-foreground">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-zadoc-sm border border-zadoc-border p-4">
                    <p className="mb-3 text-sm font-medium text-zadoc-foreground">Balance</p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-zadoc-muted">Available</p>
                        <p className="font-semibold tabular-nums">{data.earnings.available.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zadoc-muted">Pending</p>
                        <p className="font-semibold tabular-nums">{data.earnings.pending.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zadoc-muted">Total earned</p>
                        <p className="font-semibold tabular-nums">{data.earnings.total.toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawOpen === false}
                      className="mt-4 w-full rounded-full bg-zadoc-foreground py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zadoc-border disabled:text-zadoc-muted"
                    >
                      Withdraw
                    </button>
                    {!withdrawOpen && <p className="mt-2 text-xs text-zadoc-muted">Withdrawals are available Saturdays and Sundays.</p>}
                  </div>

                  <div className="rounded-zadoc-sm border border-zadoc-border p-4">
                    <p className="mb-2 text-sm font-medium text-zadoc-foreground">Your referral link</p>
                    <p className="mb-3 truncate rounded-zadoc-sm bg-zadoc-background px-3 py-2 font-mono text-sm">{data.referral_link}</p>
                    <div className="flex gap-2">
                      <button onClick={copyLink} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zadoc-border py-2 text-sm font-medium">
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </button>
                      <button onClick={shareLink} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zadoc-border py-2 text-sm font-medium">
                        <Share2 className="h-3.5 w-3.5" /> Share
                      </button>
                    </div>
                  </div>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full border border-zadoc-border py-2.5 text-sm font-medium text-zadoc-foreground"
                  >
                    <MessageCircle className="h-4 w-4" /> Creator Support
                  </a>
                </div>
              )}
            </div>

            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-zadoc-foreground px-4 py-2 text-sm text-white shadow-lg"
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
