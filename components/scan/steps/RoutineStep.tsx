'use client';

import OptionPill from '@/components/ui/OptionPill';
import ContinueButton from '@/components/ui/ContinueButton';
import type { ScanRoutine } from '@/lib/scan/types';

interface RoutineStepProps {
  value: ScanRoutine | null;
  onChange: (value: ScanRoutine) => void;
  onContinue: () => void;
}

const OPTIONS: { value: ScanRoutine; label: string }[] = [
  { value: 'none', label: "I don't really have one" },
  { value: 'simple', label: 'Simple' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'detailed', label: 'Detailed' },
];

export default function RoutineStep({ value, onChange, onContinue }: RoutineStepProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        How would you describe your skincare routine?
      </h1>
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
