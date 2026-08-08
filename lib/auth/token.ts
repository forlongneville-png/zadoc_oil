import crypto from 'crypto';

// Signed, stateless session token: base64url(payload).base64url(hmac).
// Avoids adding a JWT dependency — this is a minimal HMAC-SHA256 signature
// over a small JSON payload, which is all a session needs here (user id +
// expiry). Verified server-side only (route handlers / server components).
const SESSION_SECRET =
  process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'zadoc-dev-insecure-secret';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface SessionPayload {
  uid: string;
  exp: number; // unix seconds
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as SessionPayload;
    if (typeof payload.uid !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
    return payload.uid;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = 'zadoc_session';
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
