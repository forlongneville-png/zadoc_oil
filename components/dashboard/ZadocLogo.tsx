import Image from 'next/image';

interface ZadocLogoProps {
  withWordmark?: boolean;
  size?: number;
}

export default function ZadocLogo({ withWordmark = false, size = 32 }: ZadocLogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo/zadoc-logo.jpeg"
        alt="Zadoc"
        width={size}
        height={size}
        className="rounded-lg object-contain"
        priority
      />
      {withWordmark && (
        <span className="text-lg font-semibold tracking-tight">Zadoc</span>
      )}
    </div>
  );
}
