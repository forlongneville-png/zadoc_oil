'use client';

import { useState } from 'react';
import ContinueButton from '@/components/ui/ContinueButton';
import { ageSchema } from '@/lib/scan/validation';

interface AgeStepProps {
  value: number | null;
  onChange: (value: number | null) => void;
  onContinue: () => void;
}

export default function AgeStep({ value, onChange, onContinue }: AgeStepProps) {
  const [raw, setRaw] = useState(value?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (text: string) => {
    setRaw(text);
    if (text.trim() === '') {
      onChange(null);
      setError(null);
      return;
    }
    const num = Number(text);
    const result = ageSchema.safeParse(num);
    if (result.success) {
      onChange(result.data);
      setError(null);
    } else {
      onChange(null);
      setError(result.error.issues[0]?.message ?? 'Please enter a valid age.');
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">How old are you?</h1>
      <div>
        <input
          type="number"
          inputMode="numeric"
          value={raw}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter your age"
          min={1}
          max={120}
          className="w-full px-5 py-4 rounded-2xl border border-zadoc-border bg-white text-lg outline-none focus:border-zadoc-foreground/50 transition-colors"
        />
        {error && <p className="mt-2 text-sm text-zadoc-avoid">{error}</p>}
      </div>
      <ContinueButton onClick={onContinue} disabled={!value} />
    </div>
  );
}
