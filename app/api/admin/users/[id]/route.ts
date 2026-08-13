// ROUTE: app/api/admin/users/[id]/route.ts   (NEW FILE)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

const patchSchema = z.object({
  isExempt: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Body must be { isExempt: boolean }' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ is_exempt: parsed.data.isExempt })
    .eq('id', params.id)
    .is('deleted_at', null)
    .select('id, is_exempt')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ id: data.id, isExempt: data.is_exempt === true }, { status: 200 });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Guardrail not in the original spec, but worth having: an admin can't
  // delete their own account through this endpoint (avoids accidentally
  // locking yourself out of the panel).
  if (admin.id === params.id) {
    return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
  }

  // Hard delete — profiles, skin_analyses, and payments all cascade via FK
  // (see zadoc_schema.sql sections 3, 4, 6).
  const { error } = await supabaseAdmin.from('users').delete().eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true }, { status: 200 });
}