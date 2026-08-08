'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import type { ZadocProfile } from '@/types/zadoc';

interface ProfileSwitcherProps {
  profiles: ZadocProfile[];
  selectedId: string | null;
  onSelect: (profile: ZadocProfile) => void;
  onAddProfile: () => void;
}

export default function ProfileSwitcher({
  profiles,
  selectedId,
  onSelect,
  onAddProfile,
}: ProfileSwitcherProps) {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 py-4">
      {profiles.map((profile) => {
        const isSelected = profile.id === selectedId;
        return (
          <button
            key={profile.id}
            onClick={() => onSelect(profile)}
            className="flex flex-shrink-0 flex-col items-center gap-1.5 w-16"
          >
            <motion.div
              animate={{
                scale: isSelected ? 1.08 : 1,
                borderColor: isSelected ? 'var(--zadoc-foreground)' : 'var(--zadoc-border)',
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative h-14 w-14 overflow-hidden rounded-full border-2 bg-white"
            >
              {profile.image_url ? (
                <Image src={profile.image_url} alt={profile.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zadoc-muted">
                  {profile.name.charAt(0)}
                </div>
              )}
            </motion.div>
            <span
              className={`text-xs truncate w-full text-center ${
                isSelected ? 'font-semibold text-zadoc-foreground' : 'text-zadoc-muted'
              }`}
            >
              {profile.name}
            </span>
          </button>
        );
      })}

      <button
        onClick={onAddProfile}
        className="flex flex-shrink-0 flex-col items-center gap-1.5 w-16"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-zadoc-border bg-white text-zadoc-muted">
          <Plus size={20} />
        </div>
        <span className="text-xs text-zadoc-muted text-center leading-tight">Add profile</span>
      </button>
    </div>
  );
}
