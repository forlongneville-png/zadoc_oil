'use client';

import OptionPill from '@/components/ui/OptionPill';
import ContinueButton from '@/components/ui/ContinueButton';
import type { ScanConditionAnswer } from '@/lib/scan/types';

interface ConditionStepProps {
  answer: ScanConditionAnswer | null;
  description: string | null;
  onAnswerChange: (value: ScanConditionAnswer) => void;
  onDescriptionChange: (value: string) => void;
  onContinue: () => void;
}

const OPTIONS: { value: ScanConditionAnswer; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
  { value: 'not_sure', label: 'Not sure' },
];

export default function ConditionStep({
  answer,
  description,
  onAnswerChange,
  onDescriptionChange,
  onContinue,
}: ConditionStepProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Do you currently have any skin irritation or skin condition you want us to know about?
        </h1>
        <p className="mt-2 text-sm text-zadoc-muted">
          This is just for your own notes — it&apos;s not a diagnosis and won&apos;t be treated as one.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionPill
            key={opt.value}
            label={opt.label}
            selected={answer === opt.value}
            onClick={() => onAnswerChange(opt.value)}
          />
        ))}
      </div>
      {answer === 'yes' && (
        <textarea
          value={description ?? ''}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional — briefly describe it"
          maxLength={500}
          rows={3}
          className="w-full px-5 py-4 rounded-2xl border border-zadoc-border bg-white text-base outline-none focus:border-zadoc-foreground/50 transition-colors resize-none"
        />
      )}
      <ContinueButton onClick={onContinue} disabled={!answer} />
    </div>
  );
}
