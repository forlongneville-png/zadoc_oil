'use client';

import OptionPill from '@/components/ui/OptionPill';
import ContinueButton from '@/components/ui/ContinueButton';
import type { ScanGender } from '@/lib/scan/types';

interface GenderStepProps {
  value: ScanGender | null;
  onChange: (value: ScanGender) => void;
  onContinue: () => void;
}

const OPTIONS: { value: ScanGender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function GenderStep({ value, onChange, onContinue }: GenderStepProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">What&apos;s your gender?</h1>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionPill
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
          />
        ))}
      </div>
      <ContinueButton onClick={onContinue} disabled={!value} />
    </div>
  );
}
