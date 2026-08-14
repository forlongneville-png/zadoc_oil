// ROUTE: lib/admin/auth.ts
// Single real admin gate, used by everything under app/api/admin/** —
// including app/api/admin/products/** and app/api/admin/products/upload-image
// as of Phase 6, which folded the old ADD_PRODUCTS_PASSWORD header check into
// this is_admin check. There is now exactly one admin auth system.
import { getSessionUserId } from '@/lib/auth/session';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface AdminSessionUser {
  id: string;
  name: string;
  phone: string;
}

/** Returns the logged-in admin's basic info, or null if not logged in / not an admin.
 * Never trust a hidden button client-side — every /api/admin/* route must call
 * this itself, since this is the check that actually matters. */
export async function requireAdmin(): Promise<AdminSessionUser | null> {
  const userId = getSessionUserId();
  if (!userId) return null;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, phone, is_admin')
    .eq('id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !data || data.is_admin !== true) return null;

  return { id: data.id, name: data.name, phone: data.phone };
}