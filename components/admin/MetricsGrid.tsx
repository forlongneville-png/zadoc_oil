'use client';

import { useEffect, useState } from 'react';
import { Users, ScanFace, FolderCheck, CreditCard, Coins, HandCoins, TrendingUp } from 'lucide-react';

interface Overview {
  total_users: number;
  total_profiles: number;
  total_scans: number;
  paid_customers: number;
  total_revenue_fcfa: number;
  creator_commissions_fcfa: number;
  net_platform_revenue_fcfa: number;
}

function formatFcfa(n: number) {
  return `${n.toLocaleString('en-US')} FCFA`;
}

export function MetricsGrid() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const metrics: { label: string; value: string; icon: typeof Users }[] = data
    ? [
        { label: 'Total users', value: data.total_users.toLocaleString(), icon: Users },
        { label: 'Total profiles', value: data.total_profiles.toLocaleString(), icon: FolderCheck },
        { label: 'Total scans', value: data.total_scans.toLocaleString(), icon: ScanFace },
        { label: 'Paid customers', value: data.paid_customers.toLocaleString(), icon: CreditCard },
        { label: 'Total revenue', value: formatFcfa(data.total_revenue_fcfa), icon: Coins },
        { label: 'Creator commissions', value: formatFcfa(data.creator_commissions_fcfa), icon: HandCoins },
        { label: 'Net platform revenue', value: formatFcfa(data.net_platform_revenue_fcfa), icon: TrendingUp },
      ]
    : [];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {(data ? metrics : Array.from({ length: 7 }, () => null)).map((m, i) => (
        <div key={i} className="zadoc-card flex flex-col gap-2 !p-4">
          {m ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zadoc-background">
                <m.icon className="h-4 w-4 text-zadoc-foreground" />
              </div>
              <p className="text-xs text-zadoc-muted">{m.label}</p>
              <p className="text-lg font-semibold tabular-nums text-zadoc-foreground">{m.value}</p>
            </>
          ) : (
            <div className="h-16 animate-pulse rounded-lg bg-zadoc-border/50" />
          )}
        </div>
      ))}
    </div>
  );
}
