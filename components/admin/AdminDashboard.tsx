'use client';
// ROUTE: components/admin/AdminDashboard.tsx   (NEW FILE)
// Rendered by app/admin/page.tsx (/admin), which already did the
// server-side is_admin check. This component just fetches from the
// Phase 3 app/api/admin/** routes (they re-check is_admin themselves too)
// and renders a plain, no-frills panel — overview numbers, a user list
// with exempt-toggle + delete, and a payments total.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';

interface Overview {
  totalUsers: number;
  totalProfiles: number;
  totalScans: number;
  paidCustomers: number;
  totalRevenue: number;
}

interface AdminUserRow {
  id: string;
  name: string;
  phone: string;
  isExempt: boolean;
  isAdmin: boolean;
  createdAt: string;
  profileCount: number;
}

interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface AdminDashboardProps {
  adminName: string;
}

export default function AdminDashboard({ adminName }: AdminDashboardProps) {
  const router = useRouter();

  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, usersRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/overview', { cache: 'no-store' }),
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/payments', { cache: 'no-store' }),
      ]);

      if (!overviewRes.ok || !usersRes.ok || !paymentsRes.ok) {
        throw new Error('Failed to load admin data');
      }

      const overviewData = await overviewRes.json();
      const usersData = await usersRes.json();
      const paymentsData = await paymentsRes.json();

      setOverview(overviewData.overview);
      setUsers(usersData.users ?? []);
      setPayments(paymentsData.payments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExempt = async (user: AdminUserRow) => {
    setBusyUserId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isExempt: !user.isExempt }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isExempt: data.isExempt } : u))
      );
    } catch {
      alert('Could not update that user. Please try again.');
    } finally {
      setBusyUserId(null);
    }
  };

  const deleteUser = async (user: AdminUserRow) => {
    if (!confirm(`Delete ${user.name} (${user.phone})? This cannot be undone.`)) return;
    setBusyUserId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to delete user');
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete that user.');
    } finally {
      setBusyUserId(null);
    }
  };

  const totalPayments = payments.length;
  const totalPaymentValue = payments
    .filter((p) => p.status === 'succeeded' || p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  return (
    <div className="min-h-screen bg-zadoc-background">
      <header className="sticky top-0 z-30 flex items-center gap-3 px-5 py-4 bg-zadoc-background/90 backdrop-blur-sm border-b border-zadoc-border">
        <button
          onClick={() => router.push('/dashboard')}
          aria-label="Back to dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zadoc-border bg-white hover:bg-black/5 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-base font-semibold">Admin panel</p>
          <p className="text-xs text-zadoc-muted">Signed in as {adminName}</p>
        </div>
        <button
          onClick={() => router.push('/add_products')}
          className="ml-auto rounded-full border border-zadoc-border bg-white px-4 py-2 text-sm font-medium hover:bg-black/5 transition-colors"
        >
          Add products
        </button>
      </header>

      <main className="px-5 py-6 max-w-3xl mx-auto flex flex-col gap-8">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-zadoc-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading admin data…
          </div>
        )}

        {error && (
          <div className="rounded-zadoc-sm border border-zadoc-avoid/30 bg-zadoc-avoid/5 px-4 py-3 text-sm text-zadoc-avoid">
            {error}
          </div>
        )}

        {!loading && !error && overview && (
          <section>
            <h2 className="text-sm font-semibold text-zadoc-muted mb-3">Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Users" value={overview.totalUsers} />
              <StatCard label="Profiles" value={overview.totalProfiles} />
              <StatCard label="Scans" value={overview.totalScans} />
              <StatCard label="Paid customers" value={overview.paidCustomers} />
              <StatCard label="Total revenue" value={overview.totalRevenue.toLocaleString()} />
              <StatCard label="Payments recorded" value={totalPayments} />
            </div>
          </section>
        )}

        {!loading && !error && (
          <section>
            <h2 className="text-sm font-semibold text-zadoc-muted mb-3">Users ({users.length})</h2>
            <div className="rounded-zadoc-sm border border-zadoc-border bg-white overflow-hidden">
              {users.map((user, idx) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                    idx !== users.length - 1 ? 'border-b border-zadoc-border' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.name}
                      {user.isAdmin && (
                        <span className="ml-2 rounded-pill bg-zadoc-success/10 px-2 py-0.5 text-[11px] font-semibold text-zadoc-success">
                          admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zadoc-muted">
                      {user.phone} · {user.profileCount} profile{user.profileCount === 1 ? '' : 's'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs text-zadoc-muted">
                      <input
                        type="checkbox"
                        checked={user.isExempt}
                        disabled={busyUserId === user.id}
                        onChange={() => toggleExempt(user)}
                      />
                      Exempt
                    </label>
                    <button
                      onClick={() => deleteUser(user)}
                      disabled={busyUserId === user.id || user.isAdmin}
                      aria-label={`Delete ${user.name}`}
                      title={user.isAdmin ? 'Admins must be demoted before deletion' : 'Delete user'}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-zadoc-avoid hover:bg-zadoc-avoid/10 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="px-4 py-6 text-sm text-zadoc-muted text-center">No users yet.</p>
              )}
            </div>
          </section>
        )}

        {!loading && !error && (
          <section>
            <h2 className="text-sm font-semibold text-zadoc-muted mb-3">
              Payments — {totalPayments} total, {totalPaymentValue.toLocaleString()} confirmed
            </h2>
            <div className="rounded-zadoc-sm border border-zadoc-border bg-white overflow-hidden">
              {payments.slice(0, 20).map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${
                    idx !== Math.min(payments.length, 20) - 1 ? 'border-b border-zadoc-border' : ''
                  }`}
                >
                  <span className="text-zadoc-muted">{p.currency} {Number(p.amount).toLocaleString()}</span>
                  <span
                    className={
                      p.status === 'succeeded' || p.status === 'completed'
                        ? 'text-zadoc-success'
                        : p.status === 'failed'
                        ? 'text-zadoc-avoid'
                        : 'text-zadoc-muted'
                    }
                  >
                    {p.status}
                  </span>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="px-4 py-6 text-sm text-zadoc-muted text-center">No payments yet.</p>
              )}
            </div>
            {payments.length > 20 && (
              <p className="mt-2 text-xs text-zadoc-muted">Showing the 20 most recent of {payments.length}.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-zadoc-sm border border-zadoc-border bg-white px-4 py-3.5">
      <p className="text-xs text-zadoc-muted">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}