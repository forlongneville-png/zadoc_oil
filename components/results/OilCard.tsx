// ROUTE: components/results/OilCard.tsx
import Image from 'next/image';
import { Lock } from 'lucide-react';
import type { RecommendationListItem } from '@/lib/types';
import { isUnlocked } from '@/lib/types';

const ACCENT = {
  best: 'text-zadoc-success',
  avoid: 'text-zadoc-avoid',
} as const;

export function OilCard({
  item,
  onOpenDetail,
}: {
  item: RecommendationListItem;
  onOpenDetail: (item: RecommendationListItem) => void;
}) {
  const accent = ACCENT[item.recommendation_type];

  if (!isUnlocked(item)) {
    // Locked rank — the API never sent a name, image, or description for this
    // item, so there is nothing real to blur. We render a generic teaser only.
    return (
      <button
        onClick={() => onOpenDetail(item)}
        className="flex w-full items-center gap-4 rounded-2xl border border-zadoc-border bg-white p-4 text-left"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zadoc-background">
          <div className="zadoc-blur-surface absolute inset-0 bg-gradient-to-br from-zadoc-border to-zadoc-background" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-5 w-5 text-zadoc-muted" strokeWidth={1.75} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <span className={`text-xs font-semibold ${accent}`}>#{item.rank}</span>
          <div className="mt-1.5 h-3 w-2/3 rounded-full bg-zadoc-border" />
          <div className="mt-2 h-2.5 w-1/3 rounded-full bg-zadoc-border" />
          <p className="mt-1.5 text-xs text-zadoc-muted">{item.category} · Locked</p>
        </div>
      </button>
    );
  }

  const primaryImage = item.product.images.sort((a, b) => a.display_order - b.display_order)[0];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zadoc-border bg-white p-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zadoc-background">
        {primaryImage && (
          <Image
            src={primaryImage.image_url}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className={`text-xs font-semibold ${accent}`}>#{item.rank}</span>
        <h3 className="truncate text-sm font-semibold">{item.product.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-zadoc-muted">{item.product.description}</p>
        {item.product.price != null && (
          <p className="mt-0.5 text-xs font-medium text-zadoc-foreground">
            {item.product.price.toLocaleString()} FCFA
          </p>
        )}
        <button
          onClick={() => onOpenDetail(item)}
          className="mt-1.5 text-xs font-medium underline underline-offset-2"
        >
          More information
        </button>
      </div>
    </div>
  );
}