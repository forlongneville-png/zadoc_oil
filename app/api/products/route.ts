import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildRecommendationList } from '@/lib/recommendations';

const querySchema = z.object({
  skinType: z.enum(['dry', 'oily', 'combination', 'normal', 'sensitive']).default('oily'),
  type: z.enum(['best', 'avoid']).default('best'),
  // Real security model: the caller (results view) only ever passes the
  // ZadocProfile.is_unlocked value it already fetched from Supabase — this
  // route never derives entitlement from anything else, but it also never
  // widens what it returns beyond what the caller certified as unlocked.
  unlocked: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const parsed = querySchema.safeParse({
    skinType: searchParams.get('skinType') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    unlocked: searchParams.get('unlocked') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const { skinType, type, unlocked } = parsed.data;
  const items = await buildRecommendationList(skinType, type, unlocked);

  return NextResponse.json({ items });
}
