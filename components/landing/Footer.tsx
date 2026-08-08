import Logo from './Logo';
import type { Strings } from '@/lib/language';

interface FooterProps {
  t: Strings;
}

export default function Footer({ t }: FooterProps) {
  return (
    <footer className="border-t border-zadoc-border px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <Logo variant="full" size={24} />
        <p className="text-sm text-zadoc-muted">{t.footer.tagline}</p>
      </div>
    </footer>
  );
}
