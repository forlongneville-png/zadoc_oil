import { createClient } from '@supabase/supabase-js';

// Shared Supabase client. This piece (Foundation + Landing) does not perform
// any real queries — it exists so later pieces (auth, dashboard, scan,
// results, payments, admin) can import from the same place.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
