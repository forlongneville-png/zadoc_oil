// ROUTE: app/api/admin/auth-check/route.ts   (NEW FILE)
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ password: '' }));
  const password = typeof body?.password === 'string' ? body.password : '';

  if (process.env.ADD_PRODUCTS_PASSWORD && password === process.env.ADD_PRODUCTS_PASSWORD) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}