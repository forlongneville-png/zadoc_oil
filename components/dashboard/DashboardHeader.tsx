'use client';

import { UserRound } from 'lucide-react';
import ZadocLogo from './ZadocLogo';

interface DashboardHeaderProps {
  onOpenAccount: () => void;
}

export default function DashboardHeader({ onOpenAccount }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-zadoc-background/90 backdrop-blur-sm border-b border-zadoc-border">
      <ZadocLogo withWordmark size={30} />
      <button
        onClick={onOpenAccount}
        aria-label="Open account"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zadoc-border bg-white hover:bg-black/5 transition-colors"
      >
        <UserRound size={18} />
      </button>
    </header>
  );
}
