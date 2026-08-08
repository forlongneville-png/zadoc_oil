import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeRequestSchema } from '@/lib/scan/validation';
import type { SkinAnalysis } from '@/types/zadoc';
import type { AnalyzeApiResponse } from '@/lib/scan/types';
import { getSessionUserId } from '@/lib/auth/session';
import { getProfileForUser, markProfileProcessing, markProfileFailed, completeProfileAnalysis } from '@/lib/profiles/db';
import { uploadProfilePhoto, signProfileImageUrl } from '@/lib/storage/profile-images';
import { analyzeSkinPhoto } from '@/lib/anthropic/vision';
import { supabaseAdmin } from '@/lib/supabase/admin';

const requestSchema = analyzeRequestSchema.extend({
  profileId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { profileId, image, age, gender, routine, conditionAnswer, conditionDescription } = parsed.data;

  const profile = await getProfileForUser(profileId, userId);
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  await markProfileProcessing(profileId);

  try {
    // Real Anthropic Claude Vision call — validated structured output, retried
    // internally on invalid output. Never trusts the model blindly.
    const result = await analyzeSkinPhoto(image);

    if (!result.face_detected || result.skin_type === null || result.skin_score === null) {
      await markProfileFailed(profileId);
      return NextResponse.json({ face_detected: false, analysis: null } satisfies AnalyzeApiResponse);
    }

    // Private bucket upload — never a public URL for a face photo.
    const imagePath = await uploadProfilePhoto({ userId, profileId, imageDataUrl: image });

    const reportedCondition =
      conditionAnswer === 'yes' ? conditionDescription ?? null : conditionAnswer === 'not_sure' ? 'Not sure' : null;

    await completeProfileAnalysis({
      profileId,
      imagePath,
      skinType: result.skin_type,
      skinScore: result.skin_score,
      age,
      gender,
      routineLevel: routine,
      reportedCondition,
    });

    const { data: analysisRow, error: insertError } = await supabaseAdmin
      .from('skin_analyses')
      .insert({
        profile_id: profileId,
        image_url: imagePath,
        skin_type: result.skin_type,
        skin_score: result.skin_score,
        insights_json: result.insights,
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      })
      .select('id, profile_id, image_url, skin_type, skin_score, insights_json, created_at')
      .single();

    if (insertError || !analysisRow) {
      throw new Error(insertError?.message ?? 'Failed to save skin analysis');
    }

    const analysis: SkinAnalysis = {
      ...analysisRow,
      image_url: (await signProfileImageUrl(analysisRow.image_url)) ?? analysisRow.image_url,
    };

    return NextResponse.json({ face_detected: true, analysis } satisfies AnalyzeApiResponse);
  } catch (err) {
    await markProfileFailed(profileId);
    // eslint-disable-next-line no-console
    console.error('[zadoc] /api/analyze failed', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
