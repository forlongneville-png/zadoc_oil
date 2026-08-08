'use client';

import { cn } from '@/lib/utils';

interface OptionPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionPill({ label, selected, onClick }: OptionPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-5 py-4 rounded-2xl border transition-colors',
        selected
          ? 'border-zadoc-foreground bg-zadoc-foreground text-white'
          : 'border-zadoc-border bg-white text-zadoc-foreground hover:border-zadoc-foreground/40'
      )}
    >
      {label}
    </button>
  );
}
