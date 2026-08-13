// ROUTE: app/api/admin/overview/route.ts   (NEW FILE)
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { getAdminOverview } from '@/lib/admin/stats';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const overview = await getAdminOverview();
    return NextResponse.json({ overview }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[admin] overview query failed', err);
    return NextResponse.json({ error: 'Failed to load overview' }, { status: 500 });
  }
}