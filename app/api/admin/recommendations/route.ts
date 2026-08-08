import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/authorize';
import { listRecommendations, upsertRecommendation } from '@/lib/admin/db';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  return NextResponse.json({ recommendations: await listRecommendations() });
}

const recSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1),
  skin_type: z.enum(['dry', 'oily', 'combination', 'normal', 'sensitive']),
  recommendation_type: z.enum(['best', 'avoid']),
  rank: z.number().int().min(1).max(10),
  reason: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const body = await req.json();
  const parsed = recSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const recommendation = await upsertRecommendation(parsed.data);
    return NextResponse.json({ recommendation }, { status: parsed.data.id ? 200 : 201 });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to save ranking' }, { status });
  }
}
