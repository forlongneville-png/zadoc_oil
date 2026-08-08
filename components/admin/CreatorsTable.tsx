'use client';

import { useEffect, useState } from 'react';
import type { Creator } from '@/types/zadoc';

export interface CreatorRowData {
  creator: Creator;
  name: string;
  clicks: number;
  signups: number;
  paid_users: number;
  earnings: { available: number; pending: number; paid: number; total: number };
  paid_out: number;
}

export function CreatorsTable({ onSelect, refreshKey }: { onSelect: (row: CreatorRowData) => void; refreshKey: number }) {
  const [rows, setRows] = useState<CreatorRowData[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/creators')
      .then((r) => r.json())
      .then((d) => setRows(d.creators))
      .catch(() => setRows([]));
  }, [refreshKey]);

  return (
    <div className="zadoc-card overflow-x-auto !p-0">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-zadoc-border text-xs uppercase tracking-wide text-zadoc-muted">
            {['Creator', 'Referral code', 'Clicks', 'Signups', 'Paid users', 'Commission %', 'Earned', 'Paid out', 'Pending', 'Status'].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((row) => (
            <tr
              key={row.creator.id}
              onClick={() => onSelect(row)}
              className="cursor-pointer border-b border-zadoc-border/70 last:border-0 hover:bg-zadoc-background"
            >
              <td className="whitespace-nowrap px-4 py-3 font-medium text-zadoc-foreground">{row.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-zadoc-muted">{row.creator.referral_code}</td>
              <td className="px-4 py-3 tabular-nums">{row.clicks.toLocaleString()}</td>
              <td className="px-4 py-3 tabular-nums">{row.signups.toLocaleString()}</td>
              <td className="px-4 py-3 tabular-nums">{row.paid_users.toLocaleString()}</td>
              <td className="px-4 py-3 tabular-nums">{row.creator.commission_rate}%</td>
              <td className="px-4 py-3 tabular-nums">{row.earnings.total.toLocaleString()}</td>
              <td className="px-4 py-3 tabular-nums">{row.paid_out.toLocaleString()}</td>
              <td className="px-4 py-3 tabular-nums">{row.earnings.pending.toLocaleString()}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    row.creator.status === 'active' ? 'bg-zadoc-success/10 text-zadoc-success' : 'bg-zadoc-avoid/10 text-zadoc-avoid'
                  }`}
                >
                  {row.creator.status}
                </span>
              </td>
            </tr>
          ))}
          {rows && rows.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-sm text-zadoc-muted">No creators yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
