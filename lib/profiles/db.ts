import type { ZadocProfile } from '@/types/zadoc';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { signProfileImageUrl } from '@/lib/storage/profile-images';

// Real Supabase-backed replacement for Piece 3's lib/mock/profiles.ts +
// the in-memory array in app/api/profiles/route.ts.

type ProfileRow = ZadocProfile; // column names already match the shared ZadocProfile shape 1:1

async function withSignedImage(row: ProfileRow): Promise<ZadocProfile> {
  return { ...row, image_url: await signProfileImageUrl(row.image_url) };
}

export async function listProfilesForUser(userId: string): Promise<ZadocProfile[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(
      'id, user_id, name, image_url, age, gender, routine_level, reported_condition, skin_type, skin_score, analysis_status, is_unlocked'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return Promise.all((data as ProfileRow[]).map(withSignedImage));
}

export async function getProfileForUser(profileId: string, userId: string): Promise<ZadocProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(
      'id, user_id, name, image_url, age, gender, routine_level, reported_condition, skin_type, skin_score, analysis_status, is_unlocked'
    )
    .eq('id', profileId)
    .eq('user_id', userId) // scoped to the requesting user — never trust a bare profileId alone
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return withSignedImage(data as ProfileRow);
}

export async function createDraftProfile(userId: string, name: string): Promise<ZadocProfile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      user_id: userId,
      name,
      image_url: null,
      age: null,
      gender: null,
      routine_level: null,
      reported_condition: null,
      skin_type: null,
      skin_score: null,
      analysis_status: 'empty',
      is_unlocked: false,
    })
    .select(
      'id, user_id, name, image_url, age, gender, routine_level, reported_condition, skin_type, skin_score, analysis_status, is_unlocked'
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create profile');
  return data as ProfileRow;
}

export async function markProfileProcessing(profileId: string): Promise<void> {
  await supabaseAdmin.from('profiles').update({ analysis_status: 'processing' }).eq('id', profileId);
}

export async function markProfileFailed(profileId: string): Promise<void> {
  await supabaseAdmin.from('profiles').update({ analysis_status: 'failed' }).eq('id', profileId);
}

export async function completeProfileAnalysis(params: {
  profileId: string;
  imagePath: string;
  skinType: string;
  skinScore: number;
  age: number;
  gender: string;
  routineLevel: string;
  reportedCondition: string | null;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      image_url: params.imagePath,
      age: params.age,
      gender: params.gender,
      routine_level: params.routineLevel,
      reported_condition: params.reportedCondition,
      skin_type: params.skinType,
      skin_score: params.skinScore,
      analysis_status: 'complete',
    })
    .eq('id', params.profileId);

  if (error) throw new Error(error.message);
}
