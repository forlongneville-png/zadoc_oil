import Image from 'next/image';

interface LogoProps {
  variant?: 'full' | 'compact';
  size?: number;
  className?: string;
}

/**
 * Zadoc mark. `full` = icon + wordmark (headers, hero).
 * `compact` = icon only (tight spaces, e.g. mobile nav).
 * Always keep generous whitespace around this component — never place it
 * flush against cards, text, buttons, or screen edges.
 */
export default function Logo({ variant = 'full', size = 32, className = '' }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo/zadoc-logo.jpeg"
        alt="Zadoc"
        width={size}
        height={size}
        className="rounded-[8px] object-contain"
        style={{ width: size, height: size }}
        priority
      />
      {variant === 'full' && (
        <span className="text-[1.15rem] font-semibold tracking-tight text-zadoc-foreground">
          Zadoc
        </span>
      )}
    </div>
  );
}
