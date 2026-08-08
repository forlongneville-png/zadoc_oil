import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

// Client Components can't read the httpOnly session cookie directly — this
// route is how they check "who is logged in?" (used by the landing page,
// the dashboard, and anywhere else that needs the current user client-side).
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user }, { status: 200 });
}
