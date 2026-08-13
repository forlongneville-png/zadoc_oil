// APP: zadoc.online
// FILE: lib/admin/reporting.ts
//
// SERVER-ONLY — only ever call these from Route Handlers (app/api/**),
// same convention as lib/supabase/admin.ts. Never import this into a
// Client Component.
//
// Zadoc -> Admin, one direction only. Zadoc never queries Admin for
// anything and never talks to the Gatherer's platform at all — see
// zadoc_schema.md's "User-Only Edition" notes for why this stays this thin.
//
// These two calls are the ENTIRE surface between Zadoc and Admin:
//   1. reportSignup   — "this person signed up, they used code X (or none)"
//   2. reportPayment  — "this person just paid"
// Zadoc does not calculate commissions, does not know who a gatherer is,
// and does not store anything beyond the raw referral code string on the
// user row. Admin does all the thinking downstream of these two calls.
//
// Deliberately fire-and-forget: a slow or down Admin endpoint must never
// block or fail a real user's signup or payment. Failures are logged only.

const ADMIN_REPORTING_URL = process.env.ADMIN_REPORTING_URL;
const ADMIN_REPORTING_SECRET = process.env.ADMIN_REPORTING_SECRET;

type AdminEvent =
  | { event: 'signup'; userId: string; phone: string; referralCode: string | null }
  | { event: 'payment'; userId: string; profileId: string; paymentId: string; amount: number }
  | { event: 'click'; referralCode: string };

async function sendToAdmin(payload: AdminEvent): Promise<void> {
  if (!ADMIN_REPORTING_URL || !ADMIN_REPORTING_SECRET) {
    // Not configured yet (e.g. Admin platform doesn't exist yet, or this is
    // a local/dev environment). Skip silently rather than erroring — this
    // must never be the reason a signup or payment fails.
    // eslint-disable-next-line no-console
    console.warn(`[zadoc->admin] Skipped "${payload.event}" report — ADMIN_REPORTING_URL/SECRET not set.`);
    return;
  }

  try {
    const res = await fetch(ADMIN_REPORTING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Shared-secret auth, not a session — Admin verifies this header.
        // Swap for a stronger scheme (HMAC-signed body, etc.) once Admin's
        // real contract is defined; this is intentionally the simplest
        // thing that works for a first version.
        Authorization: `Bearer ${ADMIN_REPORTING_SECRET}`,
      },
      body: JSON.stringify(payload),
      // Keep this short — reporting must never noticeably slow down the
      // user-facing request it's attached to.
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error(`[zadoc->admin] "${payload.event}" report failed`, res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    // Network error, timeout, DNS failure — Admin being unreachable must
    // never surface to the user. Log and move on.
    // eslint-disable-next-line no-console
    console.error(`[zadoc->admin] "${payload.event}" report threw`, err);
  }
}

/** Call once per fresh ?ref= landing (see app/page.tsx's cookie-set guard,
 * which already ensures this only fires the first time a given visitor
 * picks up a code). Feeds Admin's referral_click_totals. */
export function reportClick(params: { referralCode: string }): void {
  void sendToAdmin({ event: 'click', referralCode: params.referralCode });
}

/** Call once, right after a new user row is created. Never awaited by the
 * caller in a way that blocks the response — see call sites. */
export function reportSignup(params: { userId: string; phone: string; referralCode: string | null }): void {
  void sendToAdmin({ event: 'signup', userId: params.userId, phone: params.phone, referralCode: params.referralCode });
}

/** Call once, right after a payment flips to 'successful'. */
export function reportPayment(params: {
  userId: string;
  profileId: string;
  paymentId: string;
  amount: number;
}): void {
  void sendToAdmin({
    event: 'payment',
    userId: params.userId,
    profileId: params.profileId,
    paymentId: params.paymentId,
    amount: params.amount,
  });
}