import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth/session';
import { listCreators } from '@/lib/admin/db';

export async function GET() {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Real version: resolves creator_id from the authenticated session (the
  // creators table is 1:1 with users), never from a query param.
  const creators = await listCreators();
  const row = creators.find((c) => c.creator.user_id === userId);
  if (!row) return NextResponse.json({ error: 'Not a creator account' }, { status: 403 });

  return NextResponse.json({
    ...row,
    referral_link: `zadoc.online/?ref=${row.creator.referral_code}`,
  });
}
