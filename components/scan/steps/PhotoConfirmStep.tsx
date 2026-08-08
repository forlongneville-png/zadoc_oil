'use client';

interface PhotoConfirmStepProps {
  imageDataUrl: string;
  onRetake: () => void;
  onAnalyze: () => void;
}

export default function PhotoConfirmStep({ imageDataUrl, onRetake, onAnalyze }: PhotoConfirmStepProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 py-6">
      <h1 className="text-2xl font-semibold tracking-tight text-center">Looking good?</h1>
      <div className="flex-1 rounded-3xl overflow-hidden border border-zadoc-border bg-black min-h-[280px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageDataUrl} alt="Captured scan" className="w-full h-full object-cover" />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRetake}
          className="flex-1 py-4 rounded-full border border-zadoc-border bg-white font-medium active:scale-[0.98] transition-transform"
        >
          Retake
        </button>
        <button
          onClick={onAnalyze}
          className="flex-1 py-4 rounded-full bg-zadoc-foreground text-white font-medium active:scale-[0.98] transition-transform"
        >
          Analyze
        </button>
      </div>
    </div>
  );
}
