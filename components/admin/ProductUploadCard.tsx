// ROUTE: components/admin/ProductUploadCard.tsx
'use client';

import { useState } from 'react';
import { ImageDropzone, DraftImage } from './ImageDropzone';

export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
export type RecType = 'best' | 'avoid';

export interface RecommendationDraft {
  id: string;
  skin_type: SkinType;
  recommendation_type: RecType;
  rank: number;
  reason: string;
}

export interface ProductDraft {
  localId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  benefits: string; // comma-separated in the UI, split into an array on save
  usage: string;
  warnings: string;
  active: boolean;
  images: DraftImage[];
  recommendations: RecommendationDraft[];
}

const SKIN_TYPES: SkinType[] = ['dry', 'oily', 'combination', 'normal', 'sensitive'];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function makeBlankProduct(): ProductDraft {
  return {
    localId: makeId(),
    name: '',
    slug: '',
    description: '',
    category: '',
    benefits: '',
    usage: '',
    warnings: '',
    active: true,
    images: [],
    recommendations: [],
  };
}

export function ProductUploadCard({
  draft,
  onChange,
  onRemove,
}: {
  draft: ProductDraft;
  onChange: (next: ProductDraft) => void;
  onRemove: () => void;
}) {
  const [status, setStatus] = useState<'idle' | 'working' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  function handleFilesSelected(files: FileList) {
    const room = 5 - draft.images.length;
    if (room <= 0) return;
    const toAdd = Array.from(files).slice(0, room);
    const newImages: DraftImage[] = toAdd.map((file) => ({
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
      uploading: false,
    }));
    set('images', [...draft.images, ...newImages]);
  }

  function removeImage(id: string) {
    set(
      'images',
      draft.images.filter((img) => img.id !== id)
    );
  }

  function addRecommendation() {
    set('recommendations', [
      ...draft.recommendations,
      {
        id: makeId(),
        skin_type: 'oily',
        recommendation_type: 'best',
        rank: draft.recommendations.length + 1,
        reason: '',
      },
    ]);
  }

  function updateRecommendation(id: string, patch: Partial<RecommendationDraft>) {
    set(
      'recommendations',
      draft.recommendations.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  function removeRecommendation(id: string) {
    set(
      'recommendations',
      draft.recommendations.filter((r) => r.id !== id)
    );
  }

  // Uploads every not-yet-uploaded image, in order, and returns the
  // {image_url, display_order} rows ready for POST /api/admin/products.
  async function uploadImages(): Promise<{ image_url: string; display_order: number }[]> {
    const results: { image_url: string; display_order: number }[] = [];
    const updated = [...draft.images];

    for (let i = 0; i < updated.length; i++) {
      const img = updated[i];

      if (img.uploadedUrl) {
        results.push({ image_url: img.uploadedUrl, display_order: i });
        continue;
      }

      updated[i] = { ...img, uploading: true, error: undefined };
      onChange({ ...draft, images: [...updated] });

      const form = new FormData();
      form.append('file', img.file);
      form.append('slug', draft.slug || 'untitled');

      const res = await fetch('/api/admin/products/upload-image', {
        method: 'POST',
        body: form,
      });
      const body = await res.json();

      if (!res.ok) {
        updated[i] = { ...img, uploading: false, error: body.error || 'Upload failed' };
        onChange({ ...draft, images: [...updated] });
        throw new Error(`Image ${i + 1}: ${body.error || 'Upload failed'}`);
      }

      updated[i] = { ...img, uploading: false, uploadedUrl: body.url };
      onChange({ ...draft, images: [...updated] });
      results.push({ image_url: body.url, display_order: i });
    }

    return results;
  }

  async function handleSave() {
    setStatus('working');
    setMessage('');
    setSavedId(null);

    try {
      if (!draft.name.trim()) throw new Error('Name is required');
      if (!draft.slug.trim()) throw new Error('Slug is required');

      const images = await uploadImages();

      const payload = {
        name: draft.name.trim(),
        slug: draft.slug.trim(),
        description: draft.description.trim(),
        category: draft.category.trim(),
        benefits: draft.benefits
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean),
        usage: draft.usage.trim(),
        warnings: draft.warnings.trim(),
        active: draft.active,
        images,
        recommendations: draft.recommendations.map(({ id, ...r }) => r),
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();

      if (!res.ok) throw new Error(body.error || 'Failed to save product');

      setStatus('success');
      setSavedId(body.productId);
      setMessage('Saved.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <input
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Product name"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-base font-medium"
        />
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-gray-500">
          Slug
          <input
            value={draft.slug}
            onChange={(e) => set('slug', e.target.value.toLowerCase())}
            placeholder="argan-oil"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-gray-500">
          Category
          <input
            value={draft.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="carrier oil"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="mt-3 block text-xs text-gray-500">
        Description
        <textarea
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 block text-xs text-gray-500">
        Benefits (comma-separated)
        <input
          value={draft.benefits}
          onChange={(e) => set('benefits', e.target.value)}
          placeholder="Deep hydration, Reduces fine lines"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-gray-500">
          Usage
          <input
            value={draft.usage}
            onChange={(e) => set('usage', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-gray-500">
          Warnings
          <input
            value={draft.warnings}
            onChange={(e) => set('warnings', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={draft.active} onChange={(e) => set('active', e.target.checked)} />
        Active
      </label>

      <div className="mt-4">
        <p className="mb-1 text-xs font-medium text-gray-500">Images</p>
        <ImageDropzone images={draft.images} onFilesSelected={handleFilesSelected} onRemove={removeImage} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">Recommendations (which skin types see this product)</p>
          <button type="button" onClick={addRecommendation} className="text-xs text-blue-600 hover:underline">
            + Add
          </button>
        </div>
        {draft.recommendations.map((rec) => (
          <div key={rec.id} className="mb-2 flex flex-wrap items-center gap-2 rounded-md bg-gray-50 p-2">
            <select
              value={rec.skin_type}
              onChange={(e) => updateRecommendation(rec.id, { skin_type: e.target.value as SkinType })}
              className="rounded border border-gray-300 px-2 py-1 text-xs"
            >
              {SKIN_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={rec.recommendation_type}
              onChange={(e) => updateRecommendation(rec.id, { recommendation_type: e.target.value as RecType })}
              className="rounded border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="best">best</option>
              <option value="avoid">avoid</option>
            </select>
            <input
              type="number"
              min={1}
              max={10}
              value={rec.rank}
              onChange={(e) => updateRecommendation(rec.id, { rank: Number(e.target.value) })}
              className="w-14 rounded border border-gray-300 px-2 py-1 text-xs"
            />
            <input
              value={rec.reason}
              onChange={(e) => updateRecommendation(rec.id, { reason: e.target.value })}
              placeholder="reason"
              className="min-w-[120px] flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
            />
            <button type="button" onClick={() => removeRecommendation(rec.id)} className="text-xs text-red-600">
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'working'}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {status === 'working' ? 'Saving…' : 'Upload & Save'}
        </button>
        {status === 'success' && <span className="text-sm text-green-600">Saved (id: {savedId})</span>}
        {status === 'error' && <span className="text-sm text-red-600">{message}</span>}
      </div>
    </div>
  );
}