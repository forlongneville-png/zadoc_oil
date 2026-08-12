// ROUTE: app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signupSchema, normalizeCameroonPhone } from '@/lib/auth/validation';
import { createUser, phoneExists } from '@/lib/auth/users-db';
import { startSession } from '@/lib/auth/session';
import { reportSignup } from '@/lib/admin/reporting';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ error: firstIssue?.message ?? 'Invalid input' }, { status: 400 });
  }

  const { name, phone, pin } = parsed.data;
  const normalizedPhone = normalizeCameroonPhone(phone);

  if (await phoneExists(normalizedPhone)) {
    // Deliberately generic — do not confirm which specific field collided.
    return NextResponse.json(
      { error: 'An account with this WhatsApp number already exists.' },
      { status: 409 }
    );
  }

  const referredByCode = cookies().get('zadoc_ref')?.value || null;

  const user = await createUser({ name, phone: normalizedPhone, pin, referredByCode });
  startSession(user);

  reportSignup({ userId: user.id, phone: user.phone, referralCode: referredByCode });

  return NextResponse.json({ user }, { status: 201 });
}