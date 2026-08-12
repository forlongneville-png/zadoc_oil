// ROUTE: app/api/payments/status/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth/session';
import { getPayment, isProfileUnlocked, updatePaymentStatus } from '@/lib/payments/db';
import { fapshiGetPaymentStatus } from '@/lib/payments/fapshi';
import { reportPayment } from '@/lib/admin/reporting';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let payment = await getPayment(params.id);
  if (!payment || payment.user_id !== userId) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  // Self-healing fallback: if we're still pending locally and we have a
  // provider transaction id, actively ask Fapshi instead of only waiting on
  // a webhook that might never arrive. This turns "I paid and nothing
  // happened" into "confirms within a few seconds" even when the webhook is
  // delayed, missed, or rejected for any reason.
  if (payment.status === 'pending' && payment.provider_transaction_id) {
    try {
      const liveStatus = await fapshiGetPaymentStatus(payment.provider_transaction_id);

      if (liveStatus === 'successful') {
        const updated = await updatePaymentStatus(payment.id, 'successful');
        if (updated) {
          payment = updated;
          reportPayment({
            userId: updated.user_id,
            profileId: updated.profile_id,
            paymentId: updated.id,
            amount: updated.amount,
          });
        }
      } else if (liveStatus === 'failed' || liveStatus === 'expired') {
        const updated = await updatePaymentStatus(payment.id, liveStatus);
        if (updated) payment = updated;
      }
    } catch {
      // Fapshi lookup failed (network blip, bad creds, etc.) — fall through
      // and return whatever we already have locally. The next poll retries.
    }
  }

  return NextResponse.json({
    payment,
    isUnlocked: await isProfileUnlocked(payment.profile_id),
  });
}