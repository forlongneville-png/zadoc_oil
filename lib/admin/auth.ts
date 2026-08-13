// ROUTE: lib/admin/auth.ts   (NEW FILE)
// Server-side gate for the internal /add_products tool. The client keeps a
// password in sessionStorage once unlocked and sends it back as a header on
// every write call — this is the check that actually matters, since the
// client-side gate alone can be bypassed with a raw curl request.
export function isAddProductsRequestAllowed(req: Request): boolean {
  const header = req.headers.get('x-zadoc-admin-password');
  return !!header && !!process.env.ADD_PRODUCTS_PASSWORD && header === process.env.ADD_PRODUCTS_PASSWORD;
}
export function isAddProductsRequestAllowed(req: Request): boolean {
  const header = req.headers.get('x-zadoc-admin-password');
  return !!header && !!process.env.ADD_PRODUCTS_PASSWORD && header === process.env.ADD_PRODUCTS_PASSWORD;
}

// ---------------------------------------------------------------------------
// Real admin gate (Phase 3) — used by everything under app/api/admin/overview,
// app/api/admin/users, app/api/admin/payments. Checks the actual logged-in
// session against users.is_admin, NOT the password header above. The
// password gate above stays in place for /add_products until Phase 6 decides
// whether to fold that tool into this one.
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