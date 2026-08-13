'use client';

import Image from 'next/image';
import ContinueButton from '@/components/ui/ContinueButton';

interface GuidanceStepProps {
  image: string;
  title: string;
  body: string;
  onContinue: () => void;
}

export default function GuidanceStep({ image, title, body, onContinue }: GuidanceStepProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10">
      <div className="w-40 h-40 rounded-2xl overflow-hidden border border-zadoc-border bg-white">
        <Image src={image} alt={title} width={160} height={160} className="w-full h-full object-cover" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-zadoc-muted text-sm max-w-xs mx-auto leading-relaxed">{body}</p>
      </div>
      <div className="w-full mt-6">
        <ContinueButton onClick={onContinue} />
      </div>
    </div>
  );
}
