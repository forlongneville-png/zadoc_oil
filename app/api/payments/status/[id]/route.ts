import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth/session';
import { getPayment, isProfileUnlocked } from '@/lib/payments/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const payment = await getPayment(params.id);
  if (!payment || payment.user_id !== userId) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  return NextResponse.json({
    payment,
    isUnlocked: await isProfileUnlocked(payment.profile_id),
  });
}
