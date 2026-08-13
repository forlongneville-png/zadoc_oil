// ROUTE: lib/admin/stats.ts   (NEW FILE)
//
// SERVER-ONLY — only ever call from Route Handlers (app/api/admin/**), same
// convention as lib/supabase/admin.ts.
//
// NOTE ON NAMING: this is deliberately NOT lib/admin/reporting.ts. That file
// already exists and does something unrelated — it's the outbound reporter
// that pings an external Admin/Gatherer platform about signups and payments.
// This file is the inbound side: reading rollup numbers for zadoc.online's
// own /admin panel. Two different "admin"s; keeping them in separate files
// avoids a naming collision and an accidental overwrite of working code.
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface AdminOverview {
  totalUsers: number;
  totalProfiles: number;
  totalScans: number;
  paidCustomers: number;
  totalRevenue: number;
}

/** Reads the public.admin_overview view (see zadoc_schema.sql section 10.1) —
 * one cheap call instead of five separate counts. */
export async function getAdminOverview(): Promise<AdminOverview> {
  const { data, error } = await supabaseAdmin
    .from('admin_overview')
    .select('total_users, total_profiles, total_scans, paid_customers, total_revenue')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to load admin overview');
  }

  return {
    totalUsers: data.total_users ?? 0,
    totalProfiles: data.total_profiles ?? 0,
    totalScans: data.total_scans ?? 0,
    paidCustomers: data.paid_customers ?? 0,
    totalRevenue: Number(data.total_revenue ?? 0),
  };
}