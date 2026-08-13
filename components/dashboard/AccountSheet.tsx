'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, MessageCircle, Shield, User } from 'lucide-react';
import type { ZadocUser } from '@/types/zadoc';
import BottomSheet from './BottomSheet';

const SUPPORT_URL =
  'https://wa.me/237683473299?text=Hello%20Zadoc%20support%2C%20I%20need%20help%20with%20my%20account';

interface AccountSheetProps {
  open: boolean;
  onClose: () => void;
  user: ZadocUser;
  onRequestLogout: () => void;
}

export default function AccountSheet({ open, onClose, user, onRequestLogout }: AccountSheetProps) {
  const router = useRouter();

  return (
    <BottomSheet open={open} onClose={onClose} title="Account">
      <div className="flex flex-col items-center text-center gap-3 mb-6">
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-zadoc-border bg-white">
          <User size={34} className="text-zadoc-muted" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-base font-semibold">{user.name}</p>
          <p className="text-sm text-zadoc-muted">{user.phone}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-zadoc-sm border border-zadoc-border bg-white px-4 py-3.5 hover:bg-black/5 transition-colors"
        >
          <MessageCircle size={18} className="text-zadoc-muted" />
          <span className="flex-1 text-left text-sm font-medium">Customer Support</span>
          <ChevronRight size={16} className="text-zadoc-muted" />
     </a>

        {user.isAdmin && (
          <button
            onClick={() => {
              onClose();
              router.push('/admin');
            }}
            className="flex items-center gap-3 rounded-zadoc-sm border border-zadoc-border bg-white px-4 py-3.5 hover:bg-black/5 transition-colors"
          >
            <Shield size={18} className="text-zadoc-muted" />
            <span className="flex-1 text-left text-sm font-medium">Admin panel</span>
            <ChevronRight size={16} className="text-zadoc-muted" />
          </button>
        )}

        <button
          onClick={onRequestLogout}
          className="mt-2 rounded-zadoc-sm px-4 py-3.5 text-sm font-medium text-zadoc-avoid hover:bg-zadoc-avoid/5 transition-colors"
        >
          Log out
        </button>
      </div>
    </BottomSheet>
  );
}