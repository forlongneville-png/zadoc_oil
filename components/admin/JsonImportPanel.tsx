// ROUTE: components/admin/JsonImportPanel.tsx
'use client';

import { useState } from 'react';
import { ProductDraft, makeBlankProduct } from './ProductUploadCard';

const PLACEHOLDER = `[
  {
    "name": "Argan Oil",
    "slug": "argan-oil",
    "description": "Cold-pressed argan oil for deep hydration.",
    "category": "carrier oil",
    "benefits": ["Deep hydration", "Reduces fine lines"],
    "usage": "Apply 2-3 drops at night",
    "warnings": "Patch test before first use",
    "active": true,
    "price": 5000,
    "recommendations": [
      { "skin_type": "dry", "recommendation_type": "best", "rank": 1, "reason": "Best for dry skin" }
    ]
  }
]`;

export function JsonImportPanel({ onImport }: { onImport: (drafts: ProductDraft[]) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  function handleImport() {
    setError('');
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];

      const drafts: ProductDraft[] = arr.map((item: any) => {
        const blank = makeBlankProduct();
        return {
          ...blank,
          name: item.name ?? '',
          slug: item.slug ?? '',
          description: item.description ?? '',
          category: item.category ?? '',
          benefits: Array.isArray(item.benefits) ? item.benefits.join(', ') : item.benefits ?? '',
          usage: item.usage ?? '',
          warnings: item.warnings ?? '',
          active: item.active ?? true,
          price: item.price != null ? String(item.price) : '',
          recommendations: Array.isArray(item.recommendations)
            ? item.recommendations.map((r: any) => ({
                id: Math.random().toString(36).slice(2, 10),
                skin_type: r.skin_type ?? 'oily',
                recommendation_type: r.recommendation_type ?? 'best',
                rank: r.rank ?? 1,
                reason: r.reason ?? '',
              }))
            : [],
        };
      });

      onImport(drafts);
      setText('');
    } catch {
      setError('Invalid JSON — check the format and try again.');
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-sm font-medium text-gray-700">Import from JSON</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={8}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleImport}
        disabled={!text.trim()}
        className="mt-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        Import into cards below
      </button>
      <p className="mt-2 text-[11px] text-gray-400">
        JSON only creates the product cards — you still need to attach images to each card below before saving.
      </p>
    </div>
  );
}