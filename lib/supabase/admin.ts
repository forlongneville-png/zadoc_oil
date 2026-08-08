import { createClient } from '@supabase/supabase-js';

// SERVICE-ROLE client — server-only. Bypasses Row Level Security, so this
// file must NEVER be imported from a Client Component or exposed to the
// browser. All real reads/writes to Supabase happen through this client,
// inside app/api/**/route.ts handlers only (per zadoc_storage_policies.sql
// and the RLS section of zadoc_schema.sql: anon/authenticated keys get zero
// direct table access — authorization happens in our API routes).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if ((!supabaseUrl || !serviceRoleKey) && process.env.NODE_ENV !== 'test') {
  // Don't throw at import time (breaks `next build`'s route collection when
  // env vars aren't set yet) — routes that actually touch the DB will get a
  // clear runtime error from the Supabase client instead.
  // eslint-disable-next-line no-console
  console.warn(
    '[zadoc] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — ' +
      'admin Supabase client will fail on first real query.'
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder-service-role-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
);
