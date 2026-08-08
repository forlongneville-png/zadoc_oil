'use client';

import { useEffect, useState } from 'react';
import type { RecommendationType, SkinType } from '@/types/zadoc';
import type { RecommendationListItem } from '@/lib/types';
import { OilCard } from './OilCard';

const TABS: { key: RecommendationType; label: string }[] = [
  { key: 'best', label: 'Best oils for you' },
  { key: 'avoid', label: 'Avoid' },
];

export function OilSection({
  profileName,
  skinType,
  unlocked,
  onOpenDetail,
}: {
  profileName: string;
  skinType: SkinType;
  unlocked: boolean;
  onOpenDetail: (item: RecommendationListItem) => void;
}) {
  const [tab, setTab] = useState<RecommendationType>('best');
  const [items, setItems] = useState<RecommendationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ skinType, type: tab, unlocked: String(unlocked) });
    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, skinType, unlocked]);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold leading-snug">
        {profileName}, here are the best oils for your skin profile — and the ones to avoid.
      </h2>

      <div className="mt-5 flex gap-6 border-b border-zadoc-border">
        {TABS.map(({ key, label }) => {
          const isActive = tab === key;
          const underline = key === 'best' ? 'bg-zadoc-success' : 'bg-zadoc-avoid';
          const activeText = key === 'best' ? 'text-zadoc-success' : 'text-zadoc-avoid';
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                isActive ? activeText : 'text-zadoc-muted'
              }`}
            >
              {label}
              {isActive && (
                <span className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full ${underline}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-zadoc-border/40" />
          ))}
        {!loading && items.map((item) => <OilCard key={item.id} item={item} onOpenDetail={onOpenDetail} />)}
      </div>
    </section>
  );
}
