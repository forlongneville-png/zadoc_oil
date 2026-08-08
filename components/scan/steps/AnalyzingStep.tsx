'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Image from 'next/image';
import ProgressRing from '@/components/scan/ProgressRing';
import type { ScanAnswers, AnalyzeApiResponse } from '@/lib/scan/types';
import type { SkinAnalysis } from '@/types/zadoc';

const RING_DURATION_MS = 12000;
const SKELETON_MIN_MS = 3000;
const TICK_MS = 100;

type Phase = 'ring' | 'skeleton' | 'failed';

interface AnalyzingStepProps {
  profileId: string;
  imageDataUrl: string;
  answers: ScanAnswers;
  onNoFace: () => void;
  onSuccess: (analysis: SkinAnalysis) => void;
}

async function callAnalyzeApi(
  profileId: string,
  imageDataUrl: string,
  answers: ScanAnswers
): Promise<AnalyzeApiResponse> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId,
      image: imageDataUrl,
      age: answers.age,
      gender: answers.gender,
      routine: answers.routine,
      conditionAnswer: answers.conditionAnswer,
      conditionDescription: answers.conditionDescription,
    }),
  });

  if (!res.ok) {
    throw new Error('Analyze request failed');
  }

  return (await res.json()) as AnalyzeApiResponse;
}

export default function AnalyzingStep({ profileId, imageDataUrl, answers, onNoFace, onSuccess }: AnalyzingStepProps) {
  const [phase, setPhase] = useState<Phase>('ring');
  const [elapsed, setElapsed] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  const resolvedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    resolvedRef.current = false;
    setPhase('ring');
    setElapsed(0);

    const tick = setInterval(() => {
      setElapsed((prev) => Math.min(prev + TICK_MS, RING_DURATION_MS));
    }, TICK_MS);

    const ringTimeout = setTimeout(() => {
      if (!cancelled) setPhase('skeleton');
    }, RING_DURATION_MS);

    const apiPromise = callAnalyzeApi(profileId, imageDataUrl, answers);
    const minSkeletonPromise = new Promise<void>((resolve) =>
      setTimeout(resolve, RING_DURATION_MS + SKELETON_MIN_MS)
    );

    Promise.all([apiPromise, minSkeletonPromise])
      .then(([apiResult]) => {
        if (cancelled || resolvedRef.current) return;
        resolvedRef.current = true;
        if (!apiResult.face_detected || !apiResult.analysis) {
          onNoFace();
          return;
        }
        onSuccess(apiResult.analysis);
      })
      .catch(() => {
        if (cancelled || resolvedRef.current) return;
        resolvedRef.current = true;
        setPhase('failed');
      });

    return () => {
      cancelled = true;
      clearInterval(tick);
      clearTimeout(ringTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  const progress = Math.min(elapsed / RING_DURATION_MS, 1);

  if (phase === 'failed') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-10">
        <p className="text-zadoc-muted text-sm max-w-xs">
          Something went wrong while analyzing your photo. Please try again.
        </p>
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-zadoc-foreground text-white font-medium active:scale-[0.98] transition-transform"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10">
      <div className="relative flex items-center justify-center">
        <ProgressRing progress={phase === 'ring' ? progress : 1} />
        <div className="absolute w-40 h-40 rounded-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageDataUrl} alt="Your scan" className="w-full h-full object-cover" />
        </div>
        <motion.div
          className="absolute -bottom-2 bg-white rounded-full p-2 border border-zadoc-border"
          animate={{ scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/logo/zadoc-logo.jpeg" alt="Zadoc" width={28} height={28} className="rounded-md" />
        </motion.div>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">
          {phase === 'ring' ? 'Analyzing your skin…' : 'Building your profile…'}
        </h1>
        <p className="text-zadoc-muted text-sm">This will just take a moment.</p>
      </div>

      {phase === 'skeleton' && (
        <div className="w-full space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 rounded-full bg-zadoc-border animate-pulse" style={{ width: `${90 - i * 15}%` }} />
          ))}
        </div>
      )}
    </div>
  );
}
