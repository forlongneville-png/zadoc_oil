// ROUTE: app/api/webhooks/fapshi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyFapshiWebhookSignature } from '@/lib/payments/fapshi';
import { getPaymentByExternalId, getPaymentByProviderTransactionId, updatePaymentStatus } from '@/lib/payments/db';
import { reportPayment } from '@/lib/admin/reporting';

// This route is the single source of truth for payment status — same shape
// as Piece 6's mock, just backed by real Supabase tables and real Fapshi
// signature verification. Unlocking the profile happens automatically via
// the trg_payments_successful DB trigger
// (zadoc_schema.sql) the moment we flip a payment's status to 'successful' —
// this handler never re-implements that logic, just the idempotency guard.

const webhookPayloadSchema = z.object({
  transId: z.string().min(1).optional(),
  externalId: z.string().min(1).optional(),
  status: z.enum(['successful', 'failed', 'expired', 'SUCCESSFUL', 'FAILED', 'EXPIRED']),
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get('x-fapshi-signature') ?? req.headers.get('fapshi-signature');

  if (!verifyFapshiWebhookSignature(rawBody, signatureHeader)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = webhookPayloadSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { transId, externalId, status } = parsed.data;
  const normalizedStatus = status.toLowerCase() as 'successful' | 'failed' | 'expired';

  const payment = transId
    ? await getPaymentByProviderTransactionId(transId)
    : externalId
      ? await getPaymentByExternalId(externalId)
      : null;

  if (!payment) {
    return NextResponse.json({ error: 'Unknown transId/externalId' }, { status: 404 });
  }

  // Idempotency guard: once a payment is successful it is final. Repeat
  // deliveries (Fapshi retries on non-200, network blips, etc.) must not
  // re-trigger the DB trigger's unlock logic twice.
  if (payment.status === 'successful') {
    return NextResponse.json({ ok: true, alreadyProcessed: true, payment });
  }

  const updated = await updatePaymentStatus(payment.id, normalizedStatus);
  if (!updated) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  if (updated.status === 'successful') {
    reportPayment({
      userId: updated.user_id,
      profileId: updated.profile_id,
      paymentId: updated.id,
      amount: updated.amount,
    });
  }

  return NextResponse.json({ ok: true, alreadyProcessed: false, payment: updated });
}