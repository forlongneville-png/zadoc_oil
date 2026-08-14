// ROUTE: lib/recommendations.ts
import type { RecommendationType, SkinType } from '@/types/zadoc';
import type { RecommendationListItem } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Real Supabase-backed replacement for Piece 5's lib/mock/recommendations.ts.
// Keeps the exact same locked/unlocked field-withholding shape: a locked
// rank never receives product name/description/images from this function at
// all, so there is nothing sensitive for the API route to accidentally leak.

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  benefits: string[];
  usage: string;
  warnings: string;
  active: boolean;
  price: number | null;
  product_images: { image_url: string; display_order: number }[];
}

interface RecRow {
  id: string;
  product_id: string;
  skin_type: SkinType;
  recommendation_type: RecommendationType;
  rank: number;
  reason: string;
  products: ProductRow | null;
}

export async function buildRecommendationList(
  skinType: SkinType,
  type: RecommendationType,
  unlocked: boolean
): Promise<RecommendationListItem[]> {
  const { data, error } = await supabaseAdmin
    .from('product_recommendations')
    .select(
      'id, product_id, skin_type, recommendation_type, rank, reason, products!inner(id, name, slug, description, category, benefits, usage, warnings, active, price, product_images(image_url, display_order))'
    )
    .eq('skin_type', skinType)
    .eq('recommendation_type', type)
    .eq('products.active', true)
    .order('rank', { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data as unknown as RecRow[]) ?? [];

  return rows
    .filter((row) => row.products !== null)
    .map((row): RecommendationListItem => {
      if (!unlocked) {
        return {
          locked: true,
          id: row.id,
          rank: row.rank,
          recommendation_type: row.recommendation_type,
          skin_type: row.skin_type,
          category: row.products!.category,
        };
      }

      const images = [...row.products!.product_images].sort((a, b) => a.display_order - b.display_order);

      return {
        locked: false,
        id: row.id,
        product_id: row.product_id,
        skin_type: row.skin_type,
        recommendation_type: row.recommendation_type,
        rank: row.rank,
        reason: row.reason,
        product: {
          id: row.products!.id,
          name: row.products!.name,
          slug: row.products!.slug,
          description: row.products!.description,
          category: row.products!.category,
          benefits: row.products!.benefits,
          usage: row.products!.usage,
          warnings: row.products!.warnings,
          active: row.products!.active,
          price: row.products!.price,
          images,
        },
      };
    });
}