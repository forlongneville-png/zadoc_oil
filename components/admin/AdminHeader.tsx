import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zadoc-border bg-zadoc-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-zadoc-border bg-white">
            <Image src="/logo/zadoc-logo.jpeg" alt="Zadoc" width={24} height={24} className="h-6 w-6 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-zadoc-foreground">Zadoc Admin</p>
            <p className="mt-1 text-xs text-zadoc-muted">Operations console</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-zadoc-border bg-white px-3 py-1.5 text-xs font-medium text-zadoc-muted">
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin session
        </div>
      </div>
    </header>
  );
}
