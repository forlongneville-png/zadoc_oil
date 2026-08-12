// ROUTE: lib/payments/fapshi.ts
import crypto from 'crypto';
import type { Payment } from '@/types/zadoc';

// Real Fapshi integration — replaces Piece 6's lib/mock/fapshi.ts.
//
// NOTE: field/header names below follow Fapshi's publicly documented
// "Initiate Pay" / webhook conventions (apiuser + apikey headers, amount in
// XAF, externalId passthrough, a hosted `link` to redirect the payer to).
// Verify these against the current Fapshi API docs for your account before
// going live, and adjust FAPSHI_BASE_URL for sandbox vs production.

const FAPSHI_BASE_URL = process.env.FAPSHI_BASE_URL || 'https://sandbox.fapshi.com';

export interface FapshiInitiateResult {
  checkoutUrl: string;
  transId: string;
}

export async function fapshiInitiatePay(params: {
  payment: Payment;
  returnUrl: string;
}): Promise<FapshiInitiateResult> {
  const apiUser = process.env.FAPSHI_API_USER;
  const apiKey = process.env.FAPSHI_API_KEY;
  if (!apiUser || !apiKey) throw new Error('FAPSHI_API_USER / FAPSHI_API_KEY are not set');

  const res = await fetch(`${FAPSHI_BASE_URL}/initiate-pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiuser: apiUser,
      apikey: apiKey,
    },
    body: JSON.stringify({
      amount: params.payment.amount,
      externalId: params.payment.external_id,
      redirectUrl: params.returnUrl,
      message: 'Zadoc — unlock your complete oil guide',
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Fapshi initiate-pay failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  // Fapshi's documented response includes a hosted checkout `link` and a `transId`.
  if (!data.link || !data.transId) {
    throw new Error('Unexpected Fapshi initiate-pay response shape');
  }

  return { checkoutUrl: data.link as string, transId: data.transId as string };
}

/**
 * Verifies a Fapshi webhook delivery using the shared FAPSHI_WEBHOOK_SECRET.
 * Fapshi's exact signing scheme (header name / HMAC construction) should be
 * confirmed against their docs; this implements the standard pattern of an
 * HMAC-SHA256 over the raw request body, compared in constant time, with a
 * fallback to a shared-secret header for providers that use that instead.
 */
export function verifyFapshiWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.FAPSHI_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!signatureHeader) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  // Plain shared-secret header (some Fapshi setups send the secret directly).
  if (signatureHeader === secret) return true;

  try {
    const sigBuf = Buffer.from(signatureHeader);
    const expectedBuf = Buffer.from(expected);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * NEW — direct reconciliation check against Fapshi. Used as a self-healing
 * fallback: if the webhook never arrives (network blip, missed retry, etc.),
 * the status-polling endpoint calls this directly instead of waiting forever.
 */
export async function fapshiGetPaymentStatus(
  transId: string
): Promise<'created' | 'pending' | 'successful' | 'failed' | 'expired'> {
  const apiUser = process.env.FAPSHI_API_USER;
  const apiKey = process.env.FAPSHI_API_KEY;
  if (!apiUser || !apiKey) throw new Error('FAPSHI_API_USER / FAPSHI_API_KEY are not set');

  const res = await fetch(`${FAPSHI_BASE_URL}/payment-status/${transId}`, {
    headers: { apiuser: apiUser, apikey: apiKey },
  });
  if (!res.ok) throw new Error(`Fapshi payment-status failed (${res.status})`);
  const data = await res.json();
  return String(data.status ?? '').toLowerCase() as
    | 'created'
    | 'pending'
    | 'successful'
    | 'failed'
    | 'expired';
}