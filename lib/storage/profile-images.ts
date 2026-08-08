import { supabaseAdmin } from '@/lib/supabase/admin';

// Face photos live in the PRIVATE 'profile-images' bucket (see
// zadoc_storage_policies.sql — that bucket has zero public-read policies).
// The browser never uploads directly; only this server-side helper (called
// from API routes using the service-role client) writes to it, and every
// read goes through a short-lived signed URL — never a public URL.

const BUCKET = 'profile-images';
const SIGNED_URL_TTL_SECONDS = 300; // 5 minutes

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string; ext: string } {
  const match = /^data:(image\/([a-zA-Z+]+));base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid image data URL');
  const [, mediaType, subtype, base64] = match;
  const ext = subtype === 'jpeg' ? 'jpg' : subtype;
  return { mediaType, base64, ext };
}

/** Uploads a captured scan photo (base64 data URL) and returns its private storage path. */
export async function uploadProfilePhoto(params: {
  userId: string;
  profileId: string;
  imageDataUrl: string;
}): Promise<string> {
  const { mediaType, base64, ext } = parseDataUrl(params.imageDataUrl);
  const path = `${params.userId}/${params.profileId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(base64, 'base64');

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
    contentType: mediaType,
    upsert: true,
  });
  if (error) throw new Error(`Failed to upload profile photo: ${error.message}`);

  return path; // stored as-is in profiles.image_url / skin_analyses.image_url
}

/** Turns a stored private-bucket path into a short-lived signed URL for display. Pass-through for anything that isn't a bare storage path (e.g. already a URL, or null). */
export async function signProfileImageUrl(pathOrUrl: string | null): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl; // already a URL (e.g. seed/demo data)

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(pathOrUrl, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return null;
  return data.signedUrl;
}
