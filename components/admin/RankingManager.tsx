'use client';

import { useEffect, useState } from 'react';
import { ListOrdered } from 'lucide-react';
import type { ProductRecommendation, SkinType, RecommendationType } from '@/types/zadoc';
import type { ProductFormValue } from './ProductForm';

const SKIN_TYPES: SkinType[] = ['dry', 'oily', 'combination', 'normal', 'sensitive'];

export function RankingManager({ productsRefreshKey }: { productsRefreshKey: number }) {
  const [products, setProducts] = useState<ProductFormValue[]>([]);
  const [recs, setRecs] = useState<ProductRecommendation[]>([]);
  const [skinType, setSkinType] = useState<SkinType>('dry');
  const [category, setCategory] = useState<RecommendationType>('best');
  const [rank, setRank] = useState(1);
  const [productId, setProductId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function loadRecs() {
    fetch('/api/admin/recommendations').then((r) => r.json()).then((d) => setRecs(d.recommendations));
  }

  useEffect(() => {
    fetch('/api/admin/products').then((r) => r.json()).then((d) => {
      setProducts(d.products);
      if (d.products[0]) setProductId(d.products[0].id);
    });
    loadRecs();
  }, [productsRefreshKey]);

  const clash = recs.find((r) => r.skin_type === skinType && r.recommendation_type === category && r.rank === rank);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, skin_type: skinType, recommendation_type: category, rank, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save ranking');
      setReason('');
      loadRecs();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="zadoc-card space-y-4">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4" />
          <p className="text-sm font-semibold text-zadoc-foreground">Assign ranking</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zadoc-muted">Skin type</label>
            <select value={skinType} onChange={(e) => setSkinType(e.target.value as SkinType)} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm capitalize">
              {SKIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zadoc-muted">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as RecommendationType)} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm capitalize">
              <option value="best">Best</option>
              <option value="avoid">Avoid</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zadoc-muted">Rank (1–10)</label>
            <input type="number" min={1} max={10} value={rank} onChange={(e) => setRank(Number(e.target.value))} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zadoc-muted">Product</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm">
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zadoc-muted">Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm" />
        </div>

        {clash && <p className="text-sm text-zadoc-avoid">Rank {rank} is already used for {skinType} / {category} — saving will update that entry.</p>}
        {error && <p className="text-sm text-zadoc-avoid">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting || !productId || !reason}
          className="w-full rounded-full bg-zadoc-foreground py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Save ranking
        </button>
      </div>

      <div className="zadoc-card !p-0">
        <p className="px-4 pt-4 text-sm font-semibold text-zadoc-foreground">Current rankings</p>
        <ul className="mt-2 divide-y divide-zadoc-border/70">
          {recs.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-zadoc-foreground">{r.product.name}</p>
                <p className="text-xs text-zadoc-muted capitalize">{r.skin_type} · rank {r.rank}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${r.recommendation_type === 'best' ? 'bg-zadoc-success/10 text-zadoc-success' : 'bg-zadoc-avoid/10 text-zadoc-avoid'}`}>
                {r.recommendation_type}
              </span>
            </li>
          ))}
          {recs.length === 0 && <li className="px-4 py-8 text-center text-sm text-zadoc-muted">No rankings yet.</li>}
        </ul>
      </div>
    </div>
  );
}
