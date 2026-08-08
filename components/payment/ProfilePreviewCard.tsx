'use client';

import Image from 'next/image';
import { Lock, Sparkles } from 'lucide-react';
import { ZadocProfile, ProductRecommendation } from '@/types/zadoc';

interface ProfilePreviewCardProps {
  profile: ZadocProfile;
  best: ProductRecommendation[];
  avoid: ProductRecommendation[];
  isUnlocked: boolean;
  onUnlockClick: () => void;
}

export function ProfilePreviewCard({
  profile,
  best,
  avoid,
  isUnlocked,
  onUnlockClick,
}: ProfilePreviewCardProps) {
  return (
    <div className="zadoc-card">
      <div className="flex items-center gap-4 mb-6">
        {profile.image_url && (
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-zadoc-border shrink-0">
            <Image src={profile.image_url} alt={profile.name} fill className="object-cover" />
          </div>
        )}
        <div>
          <p className="font-semibold text-lg">{profile.name}</p>
          <p className="text-sm text-zadoc-muted capitalize">{profile.skin_type} skin · score {profile.skin_score}</p>
        </div>
      </div>

      <p className="text-sm text-zadoc-muted leading-relaxed mb-6">{profile.reported_condition}</p>

      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zadoc-muted mb-3">Best oils</p>
        <ul className="space-y-2">
          {best.map((r) => (
            <li key={r.id} className="flex items-center justify-between text-sm">
              <span>{r.rank}. {r.product.name}</span>
              {!isUnlocked && r.rank > 1 && <Lock size={14} className="text-zadoc-muted" />}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zadoc-muted mb-3">Oils to avoid</p>
        {isUnlocked ? (
          <ul className="space-y-2">
            {avoid.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span>{r.rank}. {r.product.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <button
            onClick={onUnlockClick}
            className="w-full flex items-center justify-between rounded-card border border-dashed border-zadoc-border px-4 py-3 text-sm text-zadoc-muted"
          >
            <span className="flex items-center gap-2">
              <Lock size={14} /> {avoid.length} oils hidden
            </span>
            <span className="flex items-center gap-1 text-zadoc-foreground font-medium">
              <Sparkles size={14} /> Unlock
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
