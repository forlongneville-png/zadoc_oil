'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Pencil, Check } from 'lucide-react';
import type { CreatorRowData } from './CreatorsTable';

export function CreatorDetailSheet({
  row,
  onClose,
  onUpdated,
}: {
  row: CreatorRowData | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [rate, setRate] = useState(row?.creator.commission_rate ?? 15);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveRate() {
    if (!row) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: row.creator.id, commission_rate: rate }),
      });
      if (!res.ok) throw new Error('Could not update commission');
      setEditing(false);
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {row && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl rounded-t-zadoc border border-zadoc-border bg-white p-6 shadow-xl"
            style={{ maxHeight: '85vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-zadoc-foreground">{row.name}</p>
                <p className="text-sm text-zadoc-muted">{row.creator.referral_code}</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-zadoc-background" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Clicks', value: row.clicks },
                { label: 'Signups', value: row.signups },
                { label: 'Paid users', value: row.paid_users },
                { label: 'Earned total', value: `${row.earnings.total.toLocaleString()} FCFA` },
                { label: 'Available', value: `${row.earnings.available.toLocaleString()} FCFA` },
                { label: 'Pending', value: `${row.earnings.pending.toLocaleString()} FCFA` },
                { label: 'Paid out', value: `${row.paid_out.toLocaleString()} FCFA` },
              ].map((m) => (
                <div key={m.label} className="rounded-zadoc-sm border border-zadoc-border p-3">
                  <p className="text-xs text-zadoc-muted">{m.label}</p>
                  <p className="mt-1 font-semibold tabular-nums text-zadoc-foreground">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-zadoc-sm border border-zadoc-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zadoc-foreground">Commission rate</p>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-zadoc-muted hover:text-zadoc-foreground">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
              </div>
              {!editing ? (
                <p className="mt-2 text-2xl font-semibold tabular-nums">{row.creator.commission_rate}%</p>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-24 rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm"
                  />
                  <button
                    onClick={saveRate}
                    disabled={saving}
                    className="flex items-center gap-1 rounded-full bg-zadoc-foreground px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Save
                  </button>
                </div>
              )}
              {error && <p className="mt-2 text-sm text-zadoc-avoid">{error}</p>}
              <p className="mt-3 text-xs text-zadoc-muted">
                Only applies to future earnings — past commission records keep the rate they were generated with.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
