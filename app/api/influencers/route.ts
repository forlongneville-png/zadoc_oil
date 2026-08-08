import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Influencer } from '@/types/zadoc';

// Landing page reads through this route (service-role, bypasses RLS) rather
// than hitting Supabase directly from the browser — consistent with the
// "anon key never touches tables directly" rule in zadoc_schema.sql.
export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: influencers, error: infError } = await supabaseAdmin
    .from('influencers')
    .select('id, name, image_url, bio, active, display_order')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (infError || !influencers || influencers.length === 0) {
    return NextResponse.json({ influencers: [] as Influencer[] }, { status: 200 });
  }

  const ids = influencers.map((inf) => inf.id);

  const { data: videos } = await supabaseAdmin
    .from('influencer_videos')
    .select('influencer_id, platform, video_url, thumbnail_url, active, display_order')
    .in('influencer_id', ids)
    .eq('active', true)
    .order('display_order', { ascending: true });

  const result: Influencer[] = influencers.map((inf) => ({
    id: inf.id,
    name: inf.name,
    image_url: inf.image_url ?? '',
    bio: inf.bio ?? '',
    active: inf.active,
    display_order: inf.display_order,
    videos: (videos ?? [])
      .filter((v) => v.influencer_id === inf.id)
      .map((v) => ({
        platform: v.platform,
        video_url: v.video_url,
        thumbnail_url: v.thumbnail_url ?? '',
      })),
  }));

  return NextResponse.json({ influencers: result }, { status: 200 });
}