import type { ZadocProfile } from '@/types/zadoc';

/** A profile only counts as "completed" once a scan photo exists. */
export function isProfileComplete(profile: ZadocProfile): boolean {
  return profile.image_url !== null;
}

export function hasAnyCompletedProfile(profiles: ZadocProfile[]): boolean {
  return profiles.some(isProfileComplete);
}

/** Scan was started (a profile row exists) but never finished. */
export function needsScanResume(profile: ZadocProfile | undefined): boolean {
  if (!profile) return false;
  return profile.image_url === null;
}

export function createDraftProfile(userId: string, name: string): ZadocProfile {
  return {
    id: `profile-${crypto.randomUUID()}`,
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
  };
}
