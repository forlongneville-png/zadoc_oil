// ROUTE: lib/payments/db.ts
import type { Payment, PaymentStatus } from '@/types/zadoc';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Real Supabase-backed replacement for Piece 6's lib/mock/store.ts +
// lib/mock/payments.ts. The profile unlock is handled automatically by the
// trg_payments_successful DB trigger (see zadoc_schema.sql) whenever a
// payment row transitions to status = 'successful' — this module never
// duplicates that logic, it only reads/writes the payments table itself.

const PAYMENT_COLUMNS =
  'id, user_id, profile_id, amount, currency, status, external_id, provider_transaction_id, created_at, confirmed_at';

export async function createPayment(params: {
  userId: string;
  profileId: string;
  amount: number;
}): Promise<Payment> {
  const externalId = `ZADOC-PROFILE-${params.profileId}-${Date.now()}`;

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      user_id: params.userId,
      profile_id: params.profileId,
      amount: params.amount,
      currency: 'XAF',
      provider: 'fapshi',
      external_id: externalId,
      status: 'created',
    })
    .select(PAYMENT_COLUMNS)
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create payment');
  return data as Payment;
}

export async function setPaymentProviderTransactionId(paymentId: string, providerTransactionId: string) {
  await supabaseAdmin
    .from('payments')
    .update({ provider_transaction_id: providerTransactionId, status: 'pending' })
    .eq('id', paymentId);
}

export async function getPayment(id: string): Promise<Payment | null> {
  const { data } = await supabaseAdmin.from('payments').select(PAYMENT_COLUMNS).eq('id', id).maybeSingle();
  return (data as Payment) ?? null;
}

export async function getPaymentByExternalId(externalId: string): Promise<Payment | null> {
  const { data } = await supabaseAdmin
    .from('payments')
    .select(PAYMENT_COLUMNS)
    .eq('external_id', externalId)
    .maybeSingle();
  return (data as Payment) ?? null;
}

export async function getPaymentByProviderTransactionId(providerTransactionId: string): Promise<Payment | null> {
  const { data } = await supabaseAdmin
    .from('payments')
    .select(PAYMENT_COLUMNS)
    .eq('provider_transaction_id', providerTransactionId)
    .maybeSingle();
  return (data as Payment) ?? null;
}

/** Updating status to 'successful' fires trg_payments_successful, which unlocks
 * the profile automatically. */
export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment | null> {
  const { data } = await supabaseAdmin
    .from('payments')
    .update({ status })
    .eq('id', id)
    .select(PAYMENT_COLUMNS)
    .maybeSingle();
  return (data as Payment) ?? null;
}

export async function isProfileUnlocked(profileId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from('profiles').select('is_unlocked').eq('id', profileId).maybeSingle();
  return data?.is_unlocked === true;
}