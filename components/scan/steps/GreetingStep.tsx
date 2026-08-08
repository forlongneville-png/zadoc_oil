'use client';

import Image from 'next/image';
import ContinueButton from '@/components/ui/ContinueButton';

interface GreetingStepProps {
  name: string;
  onContinue: () => void;
}

export default function GreetingStep({ name, onContinue }: GreetingStepProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10">
      <Image
        src="/logo/zadoc-logo.jpeg"
        alt="Zadoc"
        width={64}
        height={64}
        className="rounded-2xl"
      />
      <h1 className="text-2xl font-semibold tracking-tight leading-snug">
        Hey {name} 👋
        <br />
        Let&apos;s take a quick look at your skin and find oils that may suit your skin profile.
      </h1>
      <div className="w-full mt-6">
        <ContinueButton onClick={onContinue} />
      </div>
    </div>
  );
}
