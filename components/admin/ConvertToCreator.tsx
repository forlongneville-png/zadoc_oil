'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Search, Check } from 'lucide-react';
import type { ZadocUser } from '@/types/zadoc';

export function ConvertToCreator({ onCreated }: { onCreated: () => void }) {
  const [users, setUsers] = useState<ZadocUser[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ZadocUser | null>(null);
  const [rate, setRate] = useState(15);
  const [result, setResult] = useState<{ referral_link: string; code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => setUsers(d.users.filter((u: ZadocUser) => u.role === 'user')))
      .catch(() => setUsers([]));
  }, []);

  const filtered = users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.phone.includes(query));

  async function confirm() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selected.id, commission_rate: rate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] ?? 'Could not create creator');
      setResult({ referral_link: data.referral_link, code: data.creator.creator.referral_code });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSelected(null);
    setQuery('');
    setRate(15);
    setResult(null);
    setError(null);
  }

  return (
    <div className="zadoc-card">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        <p className="text-sm font-semibold text-zadoc-foreground">Convert user → creator</p>
      </div>

      {result ? (
        <div className="space-y-3">
          <p className="text-sm text-zadoc-success">Creator created — referral link ready.</p>
          <div className="flex items-center justify-between rounded-zadoc-sm border border-zadoc-border bg-zadoc-background px-3 py-2 text-sm">
            <span className="font-mono">{result.referral_link}</span>
          </div>
          <button onClick={reset} className="text-sm font-medium text-zadoc-foreground underline underline-offset-4">
            Convert another user
          </button>
        </div>
      ) : !selected ? (
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zadoc-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone"
              className="w-full rounded-zadoc-sm border border-zadoc-border py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="mt-3 max-h-56 space-y-1 overflow-y-auto zadoc-scrollbar">
            {filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u)}
                className="flex w-full items-center justify-between rounded-zadoc-sm px-3 py-2 text-left text-sm hover:bg-zadoc-background"
              >
                <span className="font-medium text-zadoc-foreground">{u.name}</span>
                <span className="text-zadoc-muted">{u.phone}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-zadoc-muted">No matching users.</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm">
            <p className="font-medium text-zadoc-foreground">{selected.name}</p>
            <p className="text-zadoc-muted">{selected.phone}</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zadoc-muted">Commission %</label>
            <input
              type="number"
              min={1}
              max={100}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-28 rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-zadoc-muted">Suggested default: 15%</p>
          </div>
          {error && <p className="text-sm text-zadoc-avoid">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setSelected(null)} className="rounded-full border border-zadoc-border px-4 py-2 text-sm font-medium">
              Back
            </button>
            <button
              onClick={confirm}
              disabled={submitting}
              className="flex items-center gap-1 rounded-full bg-zadoc-foreground px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> Make creator
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
