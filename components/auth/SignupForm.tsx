'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import PinInput from './PinInput';
import { signupSchema } from '@/lib/auth/validation';
import type { ZadocUser } from '@/types/zadoc';

interface SignupFormProps {
  onSuccess: (user: ZadocUser) => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = signupSchema.safeParse({ name, phone, pin, confirmPin });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your details');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, pin, confirmPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }
      onSuccess(data.user as ZadocUser);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="signup-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="signup-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl border px-4 py-3 text-base outline-none focus:border-zadoc-foreground"
          style={{ borderColor: 'var(--zadoc-border)' }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="signup-phone" className="text-sm font-medium">
          WhatsApp number
        </label>
        <div
          className="flex items-center rounded-xl border px-4 py-3"
          style={{ borderColor: 'var(--zadoc-border)' }}
        >
          <span className="mr-2 text-zadoc-muted">+237</span>
          <input
            id="signup-phone"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="6XXXXXXXX"
            className="w-full bg-transparent text-base outline-none"
          />
        </div>
      </div>

      <PinInput label="PIN" value={pin} onChange={setPin} />
      <PinInput label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} />

      {error && <p className="text-sm text-zadoc-avoid">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-zadoc-foreground py-3.5 text-base font-medium text-white transition-opacity disabled:opacity-60"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        Create account
      </button>
    </form>
  );
}
