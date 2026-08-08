import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/authorize';
import { listCreators, convertUserToCreator, updateCreatorCommission } from '@/lib/admin/db';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  return NextResponse.json({ creators: await listCreators() });
}

const convertSchema = z.object({
  user_id: z.string().min(1),
  commission_rate: z.number().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const body = await req.json();
  const parsed = convertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const result = await convertUserToCreator(parsed.data.user_id, parsed.data.commission_rate);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 400 });
  }
}

const editCommissionSchema = z.object({
  creator_id: z.string().min(1),
  commission_rate: z.number().min(1).max(100),
});

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const body = await req.json();
  const parsed = editCommissionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const creator = await updateCreatorCommission(parsed.data.creator_id, parsed.data.commission_rate);
    return NextResponse.json({ creator });
  } catch {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }
}
