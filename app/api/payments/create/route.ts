import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUserId } from '@/lib/auth/session';
import { getProfileForUser } from '@/lib/profiles/db';
import { createPayment, setPaymentProviderTransactionId } from '@/lib/payments/db';
import { fapshiInitiatePay } from '@/lib/payments/fapshi';

const ZADOC_PRICE_FCFA = 129; // fixed one-time price, never a subscription, never taken from the client

const bodySchema = z.object({
  profileId: z.string().min(1),
  // userId is still accepted for shape-compatibility with Piece 6's UnlockModal
  // call, but the session is the actual source of truth — see check below.
  userId: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const sessionUserId = getSessionUserId();
  if (!sessionUserId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Never trust a client-supplied userId — always the session's.
  const profile = await getProfileForUser(parsed.data.profileId, sessionUserId);
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const payment = await createPayment({
    userId: sessionUserId,
    profileId: profile.id,
    amount: ZADOC_PRICE_FCFA,
  });

  const origin = req.nextUrl.origin;
  const returnUrl = `${origin}/profile/${profile.id}?payment=${payment.id}`;

  try {
    const { checkoutUrl, transId } = await fapshiInitiatePay({ payment, returnUrl });
    await setPaymentProviderTransactionId(payment.id, transId);
    return NextResponse.json({ payment: { ...payment, status: 'pending' }, checkoutUrl, transId }, { status: 201 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[zadoc] Fapshi initiate-pay failed', err);
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 });
  }
}
