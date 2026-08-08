'use client';

import { useRef } from 'react';

interface PinInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
}

export default function PinInput({ label, value, onChange, length = 4, autoFocus }: PinInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zadoc-foreground">{label}</label>
      <div
        className="flex gap-2"
        onClick={() => inputRef.current?.focus()}
      >
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-semibold"
            style={{ borderColor: 'var(--zadoc-border)' }}
          >
            {value[i] ? '•' : ''}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        inputMode="numeric"
        pattern="\d*"
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        className="sr-only"
        aria-label={label}
      />
    </div>
  );
}
