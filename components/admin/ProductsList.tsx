'use client';

import { useEffect, useState } from 'react';
import { Pencil, Ban, RotateCcw } from 'lucide-react';
import type { ProductFormValue } from './ProductForm';

export function ProductsList({ refreshKey, onEdit }: { refreshKey: number; onEdit: (p: ProductFormValue) => void }) {
  const [products, setProducts] = useState<ProductFormValue[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((d) => setProducts(d.products))
      .catch(() => setProducts([]));
  }, [refreshKey]);

  async function toggleActive(p: ProductFormValue) {
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    setProducts((prev) => prev?.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)) ?? null);
  }

  return (
    <div className="zadoc-card !p-0">
      <ul className="divide-y divide-zadoc-border/70">
        {(products ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0]?.image_url} alt="" className="h-10 w-10 rounded-zadoc-sm border border-zadoc-border object-cover" />
              <div>
                <p className="text-sm font-medium text-zadoc-foreground">{p.name}</p>
                <p className="text-xs text-zadoc-muted">{p.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${p.active ? 'bg-zadoc-success/10 text-zadoc-success' : 'bg-zadoc-muted/10 text-zadoc-muted'}`}>
                {p.active ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => onEdit(p)} className="rounded-full p-2 text-zadoc-muted hover:bg-zadoc-background" aria-label="Edit product">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => toggleActive(p)} className="rounded-full p-2 text-zadoc-muted hover:bg-zadoc-background" aria-label={p.active ? 'Deactivate product' : 'Reactivate product'}>
                {p.active ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
              </button>
            </div>
          </li>
        ))}
        {products && products.length === 0 && <li className="px-4 py-8 text-center text-sm text-zadoc-muted">No products yet.</li>}
      </ul>
    </div>
  );
}
