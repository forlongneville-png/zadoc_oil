'use client';

import { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import type { ZadocProfile } from '@/types/zadoc';
import { ResultsView } from '@/components/results/ResultsView';
import { ResultsSkeleton } from '@/components/results/ResultsSkeleton';

interface ProfileBodyProps {
  profile: ZadocProfile;
}

// The real results UI (Piece 5, composed with Piece 6's payment flow in
// ResultsView) now renders directly here once a scan is complete.
export default function ProfileBody({ profile }: ProfileBodyProps) {
  // Hold the skeleton for ~4s after landing on a completed scan, so the
  // reveal still feels intentional instead of popping in instantly.
  const [holdSkeleton, setHoldSkeleton] = useState(profile.analysis_status === 'complete');

  useEffect(() => {
    if (profile.analysis_status !== 'complete') return;
    setHoldSkeleton(true);
    const t = setTimeout(() => setHoldSkeleton(false), 4000);
    return () => clearTimeout(t);
  }, [profile.id, profile.analysis_status]);

  if (profile.analysis_status === 'complete') {
    return holdSkeleton ? <ResultsSkeleton /> : <ResultsView profileId={profile.id} />;
  }

  if (profile.analysis_status === 'failed') {
    return (
      <div className="flex-1 px-5 py-6">
        <div className="flex flex-col items-center gap-3 rounded-zadoc border border-zadoc-border bg-white px-6 py-10 text-center">
          <TriangleAlert size={22} className="text-zadoc-avoid" />
          <p className="text-sm font-medium">Analysis failed</p>
          <p className="text-xs text-zadoc-muted max-w-xs">
            Something went wrong reading this photo. Rescan from the profile switcher above to try again.
          </p>
        </div>
      </div>
    );
  }

  // 'collecting' | 'processing'
  return <ResultsSkeleton />;
}