// FILE PATH: app/add_products/page.tsx
'use client';

import { useState } from 'react';
import { JsonImportPanel } from '@/components/admin/JsonImportPanel';
import { ProductUploadCard, ProductDraft, makeBlankProduct } from '@/components/admin/ProductUploadCard';

// Internal tool, deliberately unauthenticated. See the warning banner below
// before pointing this at a public production domain.

export default function AddProductsPage() {
  const [drafts, setDrafts] = useState<ProductDraft[]>([makeBlankProduct()]);

  function updateDraft(index: number, next: ProductDraft) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? next : d)));
  }

  function removeDraft(index: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  function addBlank() {
    setDrafts((prev) => [...prev, makeBlankProduct()]);
  }

  function importFromJson(imported: ProductDraft[]) {
    setDrafts((prev) => [...prev, ...imported]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-semibold text-gray-900">Add products</h1>
      <p className="mt-1 text-sm text-gray-500">
        Paste JSON to bulk-create cards, or use the blank card below for one product. Attach images per card, then
        hit Upload &amp; Save.
      </p>
      <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        ⚠️ This route has zero access control — anyone with the URL can create products in your live DB. Fine for
        local/internal use; don't leave it reachable on a public production domain.
      </p>

      <div className="mt-6">
        <JsonImportPanel onImport={importFromJson} />
      </div>

      <div className="mt-6 space-y-6">
        {drafts.map((draft, i) => (
          <ProductUploadCard
            key={draft.localId}
            draft={draft}
            onChange={(next) => updateDraft(i, next)}
            onRemove={() => removeDraft(i)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addBlank}
        className="mt-6 w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-gray-400"
      >
        + Add another blank product
      </button>
    </div>
  );
}