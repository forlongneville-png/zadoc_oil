'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, TriangleAlert } from 'lucide-react';
import { ProfileCard } from './ProfileCard';
import { OilSection } from './OilSection';
import { FloatingCTA } from './FloatingCTA';
import { ProductSheet } from '@/components/products/ProductSheet';
import { UnlockModal } from '@/components/payment/UnlockModal';
import { PaymentStatusPanel } from '@/components/payment/PaymentStatusPanel';
import { DownloadReportButton } from '@/components/payment/DownloadReportButton';
import type { RecommendationListItem } from '@/lib/types';
import type { SkinAnalysis, ZadocProfile } from '@/types/zadoc';

// Assembly glue: composes Piece 5's real results components (ProfileCard,
// OilSection, FloatingCTA, ProductSheet) with Piece 6's real payment
// components (UnlockModal, PaymentStatusPanel, DownloadReportButton), backed
// by real data from GET /api/profiles/[id]. This is what replaces both
// Piece 4's "analysis complete" placeholder screen and Piece 3's
// "Results view renders here (Piece 5)" placeholder — no single piece owned
// a component that combined all of this, so it lives here as new glue
// rather than inside any one piece's owned files.
export function ResultsView({ profileId, onClose }: { profileId: string; onClose?: () => void }) {
  const router = useRouter();

  const [profile, setProfile] = useState<ZadocProfile | null>(null);
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [unlockOpen, setUnlockOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<RecommendationListItem | null>(null);
  // Read client-side only (avoids the useSearchParams()-needs-Suspense build
  // constraint) — this only ever matters after Fapshi redirects the browser
  // back with ?payment=..., which is inherently a client-side navigation.
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = new URLSearchParams(window.location.search).get('payment');
    if (id) setPendingPaymentId(id);
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/profiles/${profileId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile(data.profile);
      setAnalysis(data.analysis);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-zadoc border border-zadoc-border bg-white px-6 py-10 text-center">
        <Loader2 size={22} className="animate-spin text-zadoc-muted" />
        <p className="text-sm text-zadoc-muted">Loading results…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-1 flex-col items-center gap-3 rounded-zadoc border border-zadoc-border bg-white px-6 py-10 text-center">
        <TriangleAlert size={22} className="text-zadoc-avoid" />
        <p className="text-sm font-medium">Couldn&apos;t load results</p>
        <button onClick={refetch} className="text-xs font-medium underline underline-offset-2">
          Try again
        </button>
      </div>
    );
  }

  if (profile.analysis_status !== 'complete' || !analysis) {
    return (
      <div className="flex flex-1 flex-col items-center gap-3 rounded-zadoc border border-zadoc-border bg-white px-6 py-10 text-center">
        <Loader2 size={22} className="animate-spin text-zadoc-muted" />
        <p className="text-sm font-medium">Analyzing {profile.name}&apos;s skin</p>
        <p className="text-xs text-zadoc-muted max-w-xs">This usually takes a moment.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 py-6 pb-28">
      <ProfileCard profile={profile} analysis={analysis} />

      <OilSection
        profileName={profile.name}
        skinType={profile.skin_type ?? 'normal'}
        unlocked={profile.is_unlocked}
        onOpenDetail={setDetailItem}
      />

      {profile.is_unlocked ? (
        <div className="mt-6">
          <DownloadReportButton profileId={profile.id} />
        </div>
      ) : (
        <FloatingCTA onClick={() => setUnlockOpen(true)} />
      )}

      <ProductSheet
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onUnlockRequest={() => {
          setDetailItem(null);
          setUnlockOpen(true);
        }}
      />

      <UnlockModal
        open={unlockOpen}
        onClose={() => setUnlockOpen(false)}
        profileId={profile.id}
        userId={profile.user_id}
        onCheckoutReady={(checkoutUrl) => {
          setUnlockOpen(false);
          window.location.href = checkoutUrl; // hand off to Fapshi's real hosted checkout
        }}
      />

      {pendingPaymentId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-xs">
            <PaymentStatusPanel
              paymentId={pendingPaymentId}
              onUnlocked={() => {
                setPendingPaymentId(null);
                router.replace(`/profile/${profile.id}`);
                refetch();
              }}
              onDismiss={() => {
                setPendingPaymentId(null);
                router.replace(`/profile/${profile.id}`);
              }}
            />
          </div>
        </div>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="fixed left-4 top-4 z-30 rounded-full border border-zadoc-border bg-white/90 px-3 py-1.5 text-xs font-medium text-zadoc-muted backdrop-blur"
        >
          Close
        </button>
      )}
    </div>
  );
}
