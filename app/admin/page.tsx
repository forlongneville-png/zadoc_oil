// ROUTE: app/admin/page.tsx   (NEW FILE)
// URL: /admin
//
// Server Component — this is the real gate. The "Admin panel" button in
// AccountSheet.tsx only hides itself for non-admins; a non-admin who
// navigates to /admin directly still hits this requireAdmin() check before
// any HTML renders. The interactive list/toggle/delete UI is a separate
// Client Component (below) that talks to the already-gated
// app/api/admin/** routes from Phase 3.
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/dashboard');
  }

  return <AdminDashboard adminName={admin.name} />;
}