// ROUTE: app/add_products/page.tsx
// URL: /add_products
//
// Server Component gate — same pattern as app/admin/page.tsx. Previously
// this route was protected by a client-side sessionStorage password
// (ADD_PRODUCTS_PASSWORD, checked via the now-removed /api/admin/auth-check)
// separate from the real admin system. Phase 6 folded it into the one real
// is_admin gate: a non-admin who navigates here directly is redirected
// before any HTML renders, and the form itself lives in a Client Component
// below since it needs interactivity.
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { AddProductsForm } from '@/components/admin/AddProductsForm';

export default async function AddProductsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/dashboard');
  }

  return <AddProductsForm />;
}