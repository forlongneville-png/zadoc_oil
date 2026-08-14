// ROUTE: components/products/ProductSheet.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import type { RecommendationListItem } from '@/lib/types';
import { isUnlocked } from '@/lib/types';
import { ImageCarousel } from './ImageCarousel';

const ACCENT = {
  best: 'text-zadoc-success',
  avoid: 'text-zadoc-avoid',
} as const;

export function ProductSheet({
  item,
  onClose,
  onUnlockRequest,
}: {
  item: RecommendationListItem | null;
  onClose: () => void;
  onUnlockRequest: () => void;
}) {
  const open = item !== null;

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-zadoc bg-white"
          >
            <div className="flex items-center justify-between border-b border-zadoc-border px-5 py-4">
              <span className={`text-xs font-semibold ${ACCENT[item.recommendation_type]}`}>
                Rank #{item.rank}
              </span>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zadoc-muted hover:bg-zadoc-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isUnlocked(item) ? (
                <UnlockedContent item={item} />
              ) : (
                <LockedContent item={item} onUnlockRequest={onUnlockRequest} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function UnlockedContent({ item }: { item: Extract<RecommendationListItem, { locked: false }> }) {
  const { product, reason } = item;
  return (
    <div className="pb-8">
      <ImageCarousel images={product.images} alt={product.name} />
      <div className="space-y-6 px-5 pt-5">
        <div>
          <h2 className="text-xl font-semibold">{product.name}</h2>
          {product.price != null && (
            <p className="mt-0.5 text-sm font-medium text-zadoc-muted">{product.price.toLocaleString()} FCFA</p>
          )}
        </div>

        <Section title="What it is">
          <p className="text-sm leading-relaxed text-zadoc-foreground">{product.description}</p>
        </Section>

        <Section title="Why it may suit your profile">
          <p className="text-sm leading-relaxed text-zadoc-foreground">{reason}</p>
        </Section>

        <Section title="Benefits">
          <ul className="space-y-1.5">
            {product.benefits.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zadoc-foreground" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How to use">
          <p className="text-sm leading-relaxed text-zadoc-foreground">{product.usage}</p>
        </Section>

        <Section title="Things to know">
          <p className="text-sm leading-relaxed text-zadoc-muted">{product.warnings}</p>
        </Section>

        <Section title="Why it is ranked here">
          <p className="text-sm leading-relaxed text-zadoc-foreground">
            #{item.rank} for your skin profile because {reason.split('because')[1]?.trim() || reason}
          </p>
        </Section>
      </div>
    </div>
  );
}

function LockedContent({
  item,
  onUnlockRequest,
}: {
  item: Extract<RecommendationListItem, { locked: true }>;
  onUnlockRequest: () => void;
}) {
  return (
    <div className="pb-8">
      <div className="relative aspect-square w-full overflow-hidden bg-zadoc-background">
        <div className="zadoc-blur-surface absolute inset-0 bg-gradient-to-br from-zadoc-border to-zadoc-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="h-10 w-10 text-zadoc-muted" strokeWidth={1.5} />
        </div>
      </div>

      <div className="space-y-6 px-5 pt-5">
        <div>
          <div className="h-5 w-2/3 rounded-full bg-zadoc-border" />
          <p className="mt-2 text-xs text-zadoc-muted">{item.category} · Rank #{item.rank}</p>
        </div>

        {['What it is', 'Why it may suit your profile', 'Benefits', 'How to use', 'Things to know'].map(
          (title) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zadoc-muted">
                {title}
              </h3>
              <div className="mt-2 space-y-2">
                <div className="h-3 w-full rounded-full bg-zadoc-border" />
                <div className="h-3 w-5/6 rounded-full bg-zadoc-border" />
                <div className="h-3 w-2/3 rounded-full bg-zadoc-border" />
              </div>
            </div>
          )
        )}

        <button
          onClick={onUnlockRequest}
          className="w-full rounded-full bg-zadoc-foreground px-6 py-3.5 text-sm font-semibold text-white"
        >
          Unlock all oil recommendations for 129 FCFA
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zadoc-muted">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}