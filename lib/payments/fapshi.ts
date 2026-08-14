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
 *
 * Confirmed against Fapshi's actual docs (docs.fapshi.com/en/api-reference/
 * endpoint/webhook, "Webhook Security"): there is no HMAC signing scheme.
 * When a webhook secret is set on the Fapshi dashboard, every webhook
 * request includes a header called `x-wh-secret` whose value IS the secret
 * you configured — a plain equality check, not a signature over the body.
 * (An earlier version of this function assumed an HMAC-SHA256 scheme and
 * checked the wrong header name entirely — `x-fapshi-signature` — which
 * Fapshi never sends, so every real webhook was silently rejected with 401.)
 */
export function verifyFapshiWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.FAPSHI_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!signatureHeader) return false;

  try {
    const receivedBuf = Buffer.from(signatureHeader);
    const secretBuf = Buffer.from(secret);
    return receivedBuf.length === secretBuf.length && crypto.timingSafeEqual(receivedBuf, secretBuf);
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