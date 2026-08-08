import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authorize';
import { listUsers } from '@/lib/admin/db';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  return NextResponse.json({ users: await listUsers() });
}
