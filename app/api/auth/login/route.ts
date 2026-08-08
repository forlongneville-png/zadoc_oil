import { NextRequest, NextResponse } from 'next/server';
import { loginSchema, normalizeCameroonPhone } from '@/lib/auth/validation';
import { verifyUserPin } from '@/lib/auth/users-db';
import { startSession } from '@/lib/auth/session';

const GENERIC_ERROR = 'Incorrect WhatsApp number or PIN.';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    // Still generic — never reveal which field was wrong or whether the
    // phone exists.
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const { phone, pin } = parsed.data;
  const normalizedPhone = normalizeCameroonPhone(phone);

  const user = await verifyUserPin(normalizedPhone, pin);
  if (!user) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  startSession(user);

  return NextResponse.json({ user }, { status: 200 });
}
