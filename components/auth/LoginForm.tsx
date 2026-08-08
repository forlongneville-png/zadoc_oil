'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import PinInput from './PinInput';
import { loginSchema } from '@/lib/auth/validation';
import type { ZadocUser } from '@/types/zadoc';

interface LoginFormProps {
  onSuccess: (user: ZadocUser) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ phone, pin });
    if (!parsed.success) {
      // Generic message even on client-side validation failure — never hint
      // at which field is wrong.
      setError('Incorrect WhatsApp number or PIN.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Incorrect WhatsApp number or PIN.');
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
        <label htmlFor="login-phone" className="text-sm font-medium">
          WhatsApp number
        </label>
        <div
          className="flex items-center rounded-xl border px-4 py-3"
          style={{ borderColor: 'var(--zadoc-border)' }}
        >
          <span className="mr-2 text-zadoc-muted">+237</span>
          <input
            id="login-phone"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="6XXXXXXXX"
            className="w-full bg-transparent text-base outline-none"
          />
        </div>
      </div>

      <PinInput label="PIN" value={pin} onChange={setPin} />

      {error && <p className="text-sm text-zadoc-avoid">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-zadoc-foreground py-3.5 text-base font-medium text-white transition-opacity disabled:opacity-60"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        Log in
      </button>
    </form>
  );
}
