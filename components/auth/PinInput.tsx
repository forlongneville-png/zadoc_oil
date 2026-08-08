'use client';

import { useId, useRef } from 'react';

interface PinInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
}

// Real per-digit inputs, not a hidden proxy input behind decorative boxes.
// The previous version put a 1px sr-only input off-screen and relied on a
// parent div's onClick to call .focus() on it — that pattern silently
// fails to raise the keyboard on iOS Safari and many Android browsers,
// which require the tap to land on the focusable element itself. Each box
// below IS the input, so tapping it always works and the keyboard always
// opens on the correct box.
export default function PinInput({ label, value, onChange, length = 4, autoFocus }: PinInputProps) {
  const uid = useId();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  function setDigitAt(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1); // keep only the last typed digit
    const next = digits.slice();
    next[index] = digit;
    const joined = next.join('').slice(0, length);
    onChange(joined);

    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Empty box + backspace -> jump back and clear the previous digit too.
      const next = digits.slice();
      next[index - 1] = '';
      onChange(next.join(''));
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zadoc-foreground" id={`${uid}-label`}>
        {label}
      </label>
      <div className="flex gap-2" role="group" aria-labelledby={`${uid}-label`}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            id={`${uid}-${i}`}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            pattern="\d*"
            maxLength={1}
            value={digit}
            autoFocus={autoFocus && i === 0}
            onChange={(e) => setDigitAt(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={`${label} digit ${i + 1} of ${length}`}
            className="flex h-12 w-12 items-center justify-center rounded-xl border text-center text-lg font-semibold outline-none focus:border-zadoc-foreground"
            style={{ borderColor: 'var(--zadoc-border)' }}
          />
        ))}
      </div>
    </div>
  );
}