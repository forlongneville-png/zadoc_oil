// ROUTE: app/api/admin/users/route.ts   (NEW FILE)
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // profiles(count) is a PostgREST embedded aggregate — one round trip
  // instead of N+1 queries for the per-user profile count.
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, phone, is_exempt, is_admin, created_at, profiles(count)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const users = (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    isExempt: row.is_exempt === true,
    isAdmin: row.is_admin === true,
    createdAt: row.created_at,
    profileCount: row.profiles?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ users }, { status: 200 });
}