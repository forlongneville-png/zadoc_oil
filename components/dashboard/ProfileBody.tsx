'use client';

import { Loader2, TriangleAlert } from 'lucide-react';
import type { ZadocProfile } from '@/types/zadoc';
import { ResultsView } from '@/components/results/ResultsView';

interface ProfileBodyProps {
  profile: ZadocProfile;
}

// The real results UI (Piece 5, composed with Piece 6's payment flow in
// ResultsView) now renders directly here once a scan is complete.
export default function ProfileBody({ profile }: ProfileBodyProps) {
  if (profile.analysis_status === 'complete') {
    return <ResultsView profileId={profile.id} />;
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
  return (
    <div className="flex-1 px-5 py-6">
      <div className="flex flex-col items-center gap-3 rounded-zadoc border border-zadoc-border bg-white px-6 py-10 text-center">
        <Loader2 size={22} className="animate-spin text-zadoc-muted" />
        <p className="text-sm font-medium">Analyzing {profile.name}&apos;s skin</p>
        <p className="text-xs text-zadoc-muted max-w-xs">This usually takes a moment.</p>
      </div>
    </div>
  );
}
