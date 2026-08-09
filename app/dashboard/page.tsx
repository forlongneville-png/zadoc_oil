'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ScanFlow from '@/components/scan/ScanFlow';
import AccountSheet from '@/components/dashboard/AccountSheet';
import AddProfileSheet from '@/components/dashboard/AddProfileSheet';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import LogoutConfirmModal from '@/components/dashboard/LogoutConfirmModal';
import ProfileBody from '@/components/dashboard/ProfileBody';
import ProfileSwitcher from '@/components/dashboard/ProfileSwitcher';
 
import { hasAnyCompletedProfile, needsScanResume } from '@/lib/profiles/helpers';
import type { ZadocProfile, ZadocUser } from '@/types/zadoc';

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<ZadocUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [profiles, setProfiles] = useState<ZadocProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [accountOpen, setAccountOpen] = useState(false);
  const [addProfileOpen, setAddProfileOpen] = useState(false);
   
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const [scanOpen, setScanOpen] = useState(false);
  const [scanProfile, setScanProfile] = useState<{ id: string; name: string } | null>(null);

  // Real session check — redirects to the landing page's auth sheet if not logged in.
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { user: ZadocUser | null }) => {
        if (!data.user) {
          router.replace('/');
          return;
        }
        setUser(data.user);
        setAuthChecked(true);
      })
      .catch(() => router.replace('/'));
  }, [router]);

  const refetchProfiles = async () => {
    setProfilesLoading(true);
    try {
      const res = await fetch('/api/profiles', { cache: 'no-store' });
      const data = await res.json();
      const list: ZadocProfile[] = data.profiles ?? [];
      setProfiles(list);
      setSelectedId((prev) => prev ?? list[0]?.id ?? null);
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) refetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedId),
    [profiles, selectedId]
  );

  const hasCompletedProfiles = hasAnyCompletedProfile(profiles);

  const handleSelectProfile = (profile: ZadocProfile) => {
    setSelectedId(profile.id);
    if (needsScanResume(profile)) {
      setScanProfile({ id: profile.id, name: profile.name });
      setScanOpen(true);
    }
  };

  const handleStartScan = async () => {
    if (selectedProfile && needsScanResume(selectedProfile)) {
      setScanProfile({ id: selectedProfile.id, name: selectedProfile.name });
      setScanOpen(true);
      return;
    }
    if (profiles.length === 0) {
      // First-ever scan for this account — create the default "You" profile
      // to scan against, same as AddProfileSheet does for additional people.
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'You' }),
      });
      if (res.ok) {
        const { profile } = await res.json();
        setProfiles((prev) => [...prev, profile]);
        setSelectedId(profile.id);
        setScanProfile({ id: profile.id, name: profile.name });
        setScanOpen(true);
      }
      return;
    }
    setScanOpen(true);
  };

  const handleAddProfile = async (name: string) => {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return;
    const { profile } = await res.json();
    setProfiles((prev) => [...prev, profile]);
    setSelectedId(profile.id);
    setAddProfileOpen(false);
    // Auto-select then hand off to scan, per spec.
    setScanProfile({ id: profile.id, name: profile.name });
    setScanOpen(true);
  };

  const handleLogoutConfirmed = async () => {
    setLogoutConfirmOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
  };

  if (!authChecked || !user) {
    return <div className="min-h-screen bg-zadoc-background" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zadoc-background">
      <DashboardHeader onOpenAccount={() => setAccountOpen(true)} />

      {!profilesLoading && (
        <>
          {hasCompletedProfiles ? (
            <>
              <ProfileSwitcher
                profiles={profiles}
                selectedId={selectedId}
                onSelect={handleSelectProfile}
                onAddProfile={() => setAddProfileOpen(true)}
              />
              {selectedProfile && !needsScanResume(selectedProfile) && (
                <ProfileBody profile={selectedProfile} />
              )}
            </>
          ) : (
            <EmptyState onScan={handleStartScan} />
          )}
        </>
      )}

      <DashboardFooter />

    <AccountSheet
  open={accountOpen}
  onClose={() => setAccountOpen(false)}
  user={user}
  onRequestLogout={() => {
    setAccountOpen(false);
    setLogoutConfirmOpen(true);
  }}
/>

      <AddProfileSheet
        open={addProfileOpen}
        onClose={() => setAddProfileOpen(false)}
        onSubmit={handleAddProfile}
      />


      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogoutConfirmed}
      />

      {scanOpen && (
        <ScanFlow
          profileId={scanProfile?.id ?? ''}
          profileName={scanProfile?.name ?? 'You'}
          onComplete={() => {
            refetchProfiles();
          }}
          onClose={() => {
            setScanOpen(false);
            setScanProfile(null);
            refetchProfiles();
          }}
        />
      )}
    </div>
  );
}
