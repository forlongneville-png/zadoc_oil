// ROUTE: components/admin/AddProductsForm.tsx
'use client';

import { useState } from 'react';
import { JsonImportPanel } from './JsonImportPanel';
import { ProductUploadCard, ProductDraft, makeBlankProduct } from './ProductUploadCard';

// Rendered by app/add_products/page.tsx, which already did the server-side
// is_admin check (same pattern as app/admin/page.tsx). The API routes this
// calls (/api/admin/products, /api/admin/products/upload-image) re-check
// is_admin themselves too via the session cookie — no password header needed
// anymore, that was folded into the real admin gate in Phase 6.
export function AddProductsForm() {
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