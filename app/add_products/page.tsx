// ROUTE: app/add_products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { JsonImportPanel } from '@/components/admin/JsonImportPanel';
import { ProductUploadCard, ProductDraft, makeBlankProduct } from '@/components/admin/ProductUploadCard';

const STORAGE_KEY = 'zadoc_add_products_pw';

function useProductsAuth() {
  const [password, setPassword] = useState<string | null>(null);
  useEffect(() => {
    setPassword(sessionStorage.getItem(STORAGE_KEY));
  }, []);
  return {
    password,
    unlock: (pw: string) => {
      sessionStorage.setItem(STORAGE_KEY, pw);
      setPassword(pw);
    },
  };
}

export default function AddProductsPage() {
  const { password, unlock } = useProductsAuth();
  const [pw, setPw] = useState('');
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState('');
  const [drafts, setDrafts] = useState<ProductDraft[]>([makeBlankProduct()]);

  async function submit() {
    setChecking(true);
    setErr('');
    const res = await fetch('/api/admin/auth-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    setChecking(false);
    if (res.ok) unlock(pw);
    else setErr('Wrong password.');
  }

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

  if (password === null) {
    // still checking sessionStorage on mount — avoid a flash of the login form
    return null;
  }

  if (!password) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <h1 className="text-lg font-semibold">Enter admin password</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        <button
          onClick={submit}
          disabled={checking}
          className="mt-3 rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {checking ? 'Checking…' : 'Continue'}
        </button>
      </div>
    );
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
            adminPassword={password}
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