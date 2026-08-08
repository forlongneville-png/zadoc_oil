'use client';

import { useRouter } from 'next/navigation';
import { ResultsView } from '@/components/results/ResultsView';

// Assembly glue page — the return_url Fapshi redirects the browser back to
// after checkout (see app/api/payments/create/route.ts), and a stable,
// linkable place to view a profile's real results view outside the scan
// flow modal. No single piece owned "a page that shows one profile's
// results", since results were only ever specified as a state *inside* the
// dashboard/scan flow (see components/results/ResultsView.tsx for why this
// exists as new glue).
export default function ProfileResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col bg-zadoc-background">
      <ResultsView profileId={params.id} onClose={() => router.push('/dashboard')} />
    </div>
  );
}
