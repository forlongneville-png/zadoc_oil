import { NextRequest } from 'next/server';
import type { UserRole } from '@/types/zadoc';
import { getSession } from '@/lib/auth/session';

// Real replacement for Piece 7's mock role check: reads the actual signed
// session cookie and looks up the user's role from the real `users` table
// (via getSession()). The shape is unchanged (async, returns an ok/error
// union) — callers must not short-circuit with a frontend-only
// `if (role === 'admin')` check; this is the one real authorization gate.
async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getSession();
  return user?.role ?? null;
}

export async function requireAdmin(_req: NextRequest): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const role = await getCurrentUserRole();
  if (role !== 'admin') {
    return { ok: false, status: 403, message: 'Forbidden — admin role required.' };
  }
  return { ok: true };
}
