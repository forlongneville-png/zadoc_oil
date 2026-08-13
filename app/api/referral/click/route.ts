// APP: zadoc.online
// ROUTE: app/api/referral/click/route.ts  (POST /api/referral/click)
//
// app/page.tsx is a Client Component, but lib/admin/reporting.ts is
// server-only (it reads ADMIN_REPORTING_URL/SECRET, which must never reach
// the browser bundle). This thin route is the bridge: the landing page
// calls this once per fresh ?ref= landing, and this route does the actual
// server-side reportClick() call to Admin.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reportClick } from '@/lib/admin/reporting';

const bodySchema = z.object({ referralCode: z.string().min(1) });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Fire-and-forget, same as every other admin reporting call — this must
  // never block or fail the page for the visitor.
  reportClick({ referralCode: parsed.data.referralCode });

  return NextResponse.json({ ok: true });
}