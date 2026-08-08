import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUserId } from '@/lib/auth/session';
import { listProfilesForUser, createDraftProfile } from '@/lib/profiles/db';

const createProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
});

export async function GET() {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const profiles = await listProfilesForUser(userId);
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 }
    );
  }

  const draft = await createDraftProfile(userId, parsed.data.name);
  return NextResponse.json({ profile: draft }, { status: 201 });
}
