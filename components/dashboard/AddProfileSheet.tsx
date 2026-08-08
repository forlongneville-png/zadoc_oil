'use client';

import { useState } from 'react';
import BottomSheet from './BottomSheet';

interface AddProfileSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function AddProfileSheet({ open, onClose, onSubmit }: AddProfileSheetProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setName('');
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Add a profile">
      <p className="text-sm text-zadoc-muted mb-5">Who are you creating this profile for?</p>
      <label className="block text-xs font-medium text-zadoc-muted mb-1.5" htmlFor="profile-name">
        Name
      </label>
      <input
        id="profile-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Grandma"
        className="w-full rounded-zadoc-sm border border-zadoc-border bg-white px-4 py-3 text-sm outline-none focus:border-zadoc-foreground transition-colors mb-5"
        autoFocus
      />
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full rounded-full bg-zadoc-foreground px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
      >
        Continue
      </button>
    </BottomSheet>
  );
}
