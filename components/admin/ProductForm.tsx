'use client';

import { useState } from 'react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import type { SkinType } from '@/types/zadoc';

const SKIN_TYPES: SkinType[] = ['dry', 'oily', 'combination', 'normal', 'sensitive'];

export interface ProductFormValue {
  id?: string;
  name: string;
  description: string;
  category: string;
  benefits: string[];
  usage: string;
  warnings: string;
  avoid_reason: string;
  skin_type_compatibility: SkinType[];
  active: boolean;
  images: { image_url: string; display_order: number }[];
}

const empty: ProductFormValue = {
  name: '', description: '', category: '', benefits: [''], usage: '', warnings: '', avoid_reason: '',
  skin_type_compatibility: [], active: true, images: [],
};

export function ProductForm({ initial, onSaved }: { initial?: ProductFormValue; onSaved: () => void }) {
  const [value, setValue] = useState<ProductFormValue>(initial ?? empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof ProductFormValue>(key: K, v: ProductFormValue[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
  }

  function toggleSkinType(t: SkinType) {
    update('skin_type_compatibility', value.skin_type_compatibility.includes(t)
      ? value.skin_type_compatibility.filter((s) => s !== t)
      : [...value.skin_type_compatibility, t]);
  }

  function addBenefit() {
    update('benefits', [...value.benefits, '']);
  }
  function updateBenefit(i: number, v: string) {
    update('benefits', value.benefits.map((b, idx) => (idx === i ? v : b)));
  }
  function removeBenefit(i: number) {
    update('benefits', value.benefits.filter((_, idx) => idx !== i));
  }

  function addImageUrl(url: string) {
    if (!url || value.images.length >= 5) return;
    update('images', [...value.images, { image_url: url, display_order: value.images.length }]);
  }
  function removeImage(i: number) {
    update('images', value.images.filter((_, idx) => idx !== i).map((img, idx) => ({ ...img, display_order: idx })));
  }
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file); // local preview only — real upload wires storage at merge time
    addImageUrl(url);
    e.target.value = '';
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = { ...value, benefits: value.benefits.filter(Boolean) };
      const res = await fetch('/api/admin/products', {
        method: value.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] ?? 'Could not save product');
      }
      setSuccess(true);
      if (!value.id) setValue(empty);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="zadoc-card space-y-4">
      <p className="text-sm font-semibold text-zadoc-foreground">{value.id ? 'Edit product' : 'New product'}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zadoc-muted">Name</label>
          <input value={value.name} onChange={(e) => update('name', e.target.value)} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zadoc-muted">Category</label>
          <input value={value.category} onChange={(e) => update('category', e.target.value)} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zadoc-muted">Description</label>
        <textarea value={value.description} onChange={(e) => update('description', e.target.value)} rows={2} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zadoc-muted">Benefits</label>
        <div className="space-y-2">
          {value.benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={b} onChange={(e) => updateBenefit(i, e.target.value)} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm" placeholder="e.g. Evens tone" />
              <button onClick={() => removeBenefit(i)} className="rounded-full p-1.5 text-zadoc-muted hover:bg-zadoc-background" aria-label="Remove benefit">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addBenefit} className="mt-2 flex items-center gap-1 text-sm font-medium text-zadoc-foreground">
          <Plus className="h-3.5 w-3.5" /> Add benefit
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zadoc-muted">How to use</label>
          <textarea value={value.usage} onChange={(e) => update('usage', e.target.value)} rows={2} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zadoc-muted">Warnings</label>
          <textarea value={value.warnings} onChange={(e) => update('warnings', e.target.value)} rows={2} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zadoc-muted">Avoid reason (if applicable)</label>
        <input value={value.avoid_reason} onChange={(e) => update('avoid_reason', e.target.value)} className="w-full rounded-zadoc-sm border border-zadoc-border px-3 py-2 text-sm" placeholder="Why to avoid for certain skin types" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zadoc-muted">Skin type compatibility</label>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => toggleSkinType(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                value.skin_type_compatibility.includes(t)
                  ? 'border-zadoc-foreground bg-zadoc-foreground text-white'
                  : 'border-zadoc-border text-zadoc-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zadoc-muted">Images (1–5)</label>
        <div className="flex flex-wrap gap-2">
          {value.images.map((img, i) => (
            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-zadoc-sm border border-zadoc-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url} alt="" className="h-full w-full object-cover" />
              <button onClick={() => removeImage(i)} className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5" aria-label="Remove image">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {value.images.length < 5 && (
            <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-zadoc-sm border border-dashed border-zadoc-border text-zadoc-muted">
              <ImageIcon className="h-4 w-4" />
              <span className="text-[10px]">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          )}
        </div>
        <p className="mt-1 text-xs text-zadoc-muted">Local previews only in this demo — storage wires up at merge time.</p>
      </div>

      <div className="flex items-center justify-between rounded-zadoc-sm border border-zadoc-border px-3 py-2">
        <span className="text-sm font-medium text-zadoc-foreground">Active</span>
        <button
          onClick={() => update('active', !value.active)}
          className={`h-6 w-11 rounded-full transition-colors ${value.active ? 'bg-zadoc-success' : 'bg-zadoc-border'}`}
        >
          <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${value.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {error && <p className="text-sm text-zadoc-avoid">{error}</p>}
      {success && <p className="text-sm text-zadoc-success">Saved.</p>}

      <button
        onClick={submit}
        disabled={submitting || !value.name || value.images.length === 0}
        className="w-full rounded-full bg-zadoc-foreground py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {value.id ? 'Save changes' : 'Create product'}
      </button>
    </div>
  );
}
