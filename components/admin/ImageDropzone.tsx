// FILE PATH: components/admin/ImageDropzone.tsx
'use client';

import { useRef } from 'react';

export interface DraftImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  uploading: boolean;
  error?: string;
}

export function ImageDropzone({
  images,
  onFilesSelected,
  onRemove,
}: {
  images: DraftImage[];
  onFilesSelected: (files: FileList) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) onFilesSelected(e.dataTransfer.files);
        }}
        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 hover:border-gray-400"
      >
        Click or drop images here (JPEG / PNG / WEBP, up to 5)
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onFilesSelected(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((img, i) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-md border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">{i}</span>
              {img.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-white">
                  Uploading…
                </div>
              )}
              {img.uploadedUrl && !img.uploading && (
                <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 py-0.5 text-center text-[10px] text-white">
                  Uploaded
                </div>
              )}
              {img.error && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-600/80 py-0.5 text-center text-[10px] text-white">
                  Failed
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] text-white"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}