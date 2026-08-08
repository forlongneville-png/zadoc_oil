import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth/session';
import { getProfileForUser } from '@/lib/profiles/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { signProfileImageUrl } from '@/lib/storage/profile-images';
import type { SkinAnalysis } from '@/types/zadoc';

// New route (assembly glue — no single piece owned a "fetch one profile +
// its latest analysis" endpoint). Backs the real results view that replaces
// Piece 3's "Results view renders here (Piece 5)" placeholder.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const profile = await getProfileForUser(params.id, userId);
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  let analysis: SkinAnalysis | null = null;
  if (profile.analysis_status === 'complete') {
    const { data } = await supabaseAdmin
      .from('skin_analyses')
      .select('id, profile_id, image_url, skin_type, skin_score, insights_json, created_at')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      analysis = {
        ...data,
        image_url: (await signProfileImageUrl(data.image_url)) ?? data.image_url,
      } as SkinAnalysis;
    }
  }

  return NextResponse.json({ profile, analysis });
}
