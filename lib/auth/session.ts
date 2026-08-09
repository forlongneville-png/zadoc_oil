import { cookies } from 'next/headers';
import type { ZadocUser } from '@/types/zadoc';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createSessionToken, verifySessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth/token';

// Real session mechanism (Supabase-backed, signed httpOnly cookie).
// Server-only — call these from Route Handlers (app/api/**/route.ts) or
// Server Components, never from Client Components. Client Components should
// hit /api/auth/me instead. Zadoc uses custom WhatsApp+PIN auth rather than
// Supabase Auth, so this is a small first-party session layer instead of
// supabase.auth.getSession().

/** Reads + verifies the session cookie. Returns the authenticated user's id, or null. */
export function getSessionUserId(): string | null {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/** Reads the session cookie and loads the full user row from Supabase. */
export async function getSession(): Promise<ZadocUser | null> {
  const userId = getSessionUserId();
  if (!userId) return null;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, phone, language, created_at')
    .eq('id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !data) return null;
  return data as ZadocUser;
}

export async function hasValidSession(): Promise<boolean> {
  return (await getSession()) !== null;
}

/** Sets the signed session cookie for a freshly authenticated user. Call from a Route Handler. */
export function startSession(user: Pick<ZadocUser, 'id'>): void {
  const token = createSessionToken(user.id);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function endSession(): void {
  cookies().set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}