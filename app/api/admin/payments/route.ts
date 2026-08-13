// ROUTE: app/api/admin/payments/route.ts   (NEW FILE)
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select(
      'id, amount, currency, status, external_id, provider_transaction_id, created_at, confirmed_at, ' +
        'users(name, phone), profiles(name)'
    )
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const payments = (data ?? []).map((row: any) => ({
    id: row.id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    externalId: row.external_id,
    providerTransactionId: row.provider_transaction_id,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
    userName: row.users?.name ?? null,
    userPhone: row.users?.phone ?? null,
    profileName: row.profiles?.name ?? null,
  }));

  return NextResponse.json({ payments }, { status: 200 });
}