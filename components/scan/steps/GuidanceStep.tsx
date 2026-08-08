'use client';

import type { LucideIcon } from 'lucide-react';
import ContinueButton from '@/components/ui/ContinueButton';

interface GuidanceStepProps {
  icon: LucideIcon;
  title: string;
  body: string;
  onContinue: () => void;
}

export default function GuidanceStep({ icon: Icon, title, body, onContinue }: GuidanceStepProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10">
      <div className="w-24 h-24 rounded-full bg-white border border-zadoc-border flex items-center justify-center">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-zadoc-muted text-sm max-w-xs mx-auto leading-relaxed">{body}</p>
      </div>
      <div className="w-full mt-6">
        <ContinueButton onClick={onContinue} />
      </div>
    </div>
  );
}
