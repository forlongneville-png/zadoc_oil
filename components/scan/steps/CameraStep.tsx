'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { mockQualityCheck } from '@/lib/scan/mockQualityCheck';

interface CameraStepProps {
  onCaptured: (dataUrl: string) => void;
  onQualityFail: () => void;
}

export default function CameraStep({ onCaptured, onQualityFail }: CameraStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        if (!cancelled) {
          setCameraError('Camera access is needed to take your scan photo. Please allow camera access and retry.');
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || capturing) return;
    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCapturing(false);
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const quality = await mockQualityCheck(dataUrl);
    setCapturing(false);

    if (!quality.passed) {
      onQualityFail();
      return;
    }

    onCaptured(dataUrl);
  };

  return (
    <div className="flex-1 flex flex-col -mx-6 -mb-6">
      <div className="px-6 pb-3 text-center">
        <span className="text-xs tracking-widest uppercase text-zadoc-muted">zadoc.online</span>
      </div>

      <div className="relative flex-1 bg-black overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Face-positioning guide overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-56 h-72 rounded-[50%] border-2 border-white/70" />
        </div>

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-8">
            <p className="text-white text-sm text-center">{cameraError}</p>
          </div>
        )}
      </div>

      <div className="py-6 flex items-center justify-center bg-zadoc-background">
        <button
          onClick={handleCapture}
          disabled={!ready || capturing}
          aria-label="Capture photo"
          className="w-18 h-18 rounded-full border-4 border-zadoc-foreground p-1 disabled:opacity-40 transition-opacity"
          style={{ width: 72, height: 72 }}
        >
          <span className="flex items-center justify-center w-full h-full rounded-full bg-zadoc-foreground">
            <Camera size={26} className="text-white" />
          </span>
        </button>
      </div>
    </div>
  );
}
