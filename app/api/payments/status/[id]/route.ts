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
  //
  // IMPORTANT — asymmetric on purpose: this poll may only ever *confirm
  // success*. It must never write 'failed' or 'expired'. A single opportunistic
  // status read is not authoritative — mobile-money (MTN/Orange) payments
  // routinely sit in an ambiguous state while the payer is still confirming
  // the USSD prompt on their phone, and a snapshot read can catch that
  // in-flight moment and misreport it as failed. That's a legitimate payment
  // getting shown to the user as "failed," which is exactly what must never
  // happen. Negative outcomes are the webhook's call alone: it's the
  // provider's own pushed, deliberate signal, not a racy poll. If the
  // webhook is ever wrong or delayed, worst case here is the user keeps
  // seeing "still confirming" — never a false failure.
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
      }
      // Deliberately no else-branch for 'failed' / 'expired' — see comment above.
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