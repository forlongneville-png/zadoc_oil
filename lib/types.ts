import type { ProductRecommendation, RecommendationType, SkinType } from '@/types/zadoc';

// The API route withholds full product fields for locked ranks — the client
// never receives name/description/images for locked items, it only ever
// gets this minimal teaser shape. This mirrors the real security model.
export interface LockedTeaser {
  locked: true;
  id: string;
  rank: number;
  recommendation_type: RecommendationType;
  skin_type: SkinType;
  category: string; // safe-to-show teaser metadata only
}

export interface UnlockedRecommendation extends ProductRecommendation {
  locked: false;
}

export type RecommendationListItem = LockedTeaser | UnlockedRecommendation;

export function isUnlocked(item: RecommendationListItem): item is UnlockedRecommendation {
  return item.locked === false;
}
