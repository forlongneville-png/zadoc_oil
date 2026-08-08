'use client';

import { useState } from 'react';
import Image from 'next/image';

export function ImageCarousel({
  images,
  alt,
}: {
  images: { image_url: string; display_order: number }[];
  alt: string;
}) {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
  const [index, setIndex] = useState(0);

  if (sorted.length === 0) return null;

  return (
    <div>
      <div
        className="flex snap-x snap-mandatory overflow-x-auto zadoc-scrollbar-hide"
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== index) setIndex(i);
        }}
      >
        {sorted.map((img, i) => (
          <div key={i} className="relative aspect-square w-full shrink-0 snap-center">
            <Image src={img.image_url} alt={`${alt} ${i + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {sorted.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-4 bg-zadoc-foreground' : 'w-1.5 bg-zadoc-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
