'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Sun, Ruler, ScanFace } from 'lucide-react';
import ScanOverlay from '@/components/scan/ScanOverlay';
import Toast from '@/components/scan/Toast';
import GreetingStep from '@/components/scan/steps/GreetingStep';
import GenderStep from '@/components/scan/steps/GenderStep';
import AgeStep from '@/components/scan/steps/AgeStep';
import RoutineStep from '@/components/scan/steps/RoutineStep';
import ConditionStep from '@/components/scan/steps/ConditionStep';
import GuidanceStep from '@/components/scan/steps/GuidanceStep';
import CameraStep from '@/components/scan/steps/CameraStep';
import PhotoConfirmStep from '@/components/scan/steps/PhotoConfirmStep';
import AnalyzingStep from '@/components/scan/steps/AnalyzingStep';

import {
  INITIAL_SCAN_ANSWERS,
  SCAN_STEP_ORDER,
  type ScanAnswers,
  type ScanStep,
  type ScanFlowProps,
} from '@/lib/scan/types';
import type { SkinAnalysis } from '@/types/zadoc';

const GUIDANCE_CONTENT: Record<string, { icon: typeof Sparkles; title: string; body: string }> = {
  'guidance-camera': {
    icon: Sparkles,
    title: 'Clean your camera',
    body: 'Wipe your lens before taking the photo so we can get a clear, sharp image of your skin.',
  },
  'guidance-lighting': {
    icon: Sun,
    title: 'Find good lighting',
    body: 'Stand somewhere bright and evenly lit. Avoid dark rooms or harsh shadows on your face.',
  },
  'guidance-distance': {
    icon: Ruler,
    title: 'Keep your face at the right distance',
    body: 'Make sure your whole face is clearly visible in frame — not too close, not too far.',
  },
  'guidance-look': {
    icon: ScanFace,
    title: 'Look directly at the camera',
    body: 'Avoid sunglasses, masks, or hands covering your face, and skip extreme angles.',
  },
};

export default function ScanFlow({ profileId, profileName, onComplete, onClose }: ScanFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<ScanAnswers>(INITIAL_SCAN_ANSWERS);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null);

  const step: ScanStep = SCAN_STEP_ORDER[stepIndex];

  const showBack = useMemo(
    () => !['greeting', 'analyzing', 'complete'].includes(step),
    [step]
  );

  const goNext = () => setStepIndex((i) => Math.min(i + 1, SCAN_STEP_ORDER.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));
  const goToStep = (target: ScanStep) => setStepIndex(SCAN_STEP_ORDER.indexOf(target));

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateAnswers = (partial: Partial<ScanAnswers>) =>
    setAnswers((prev) => ({ ...prev, ...partial }));

  const handleQualityFail = () => {
    showToast('That photo is a little blurry. Please take another one so we can get a clearer analysis.');
    // Stays on the camera step — never restarts the questionnaire.
  };

  const handleNoFace = () => {
    showToast('No face detected. Please try again with a clear photo of your face.');
    goToStep('confirm'); // returns to the captured-image state, never restarts the questionnaire
  };

  const handleAnalysisSuccess = (result: SkinAnalysis) => {
    setAnalysis(result);
    onComplete(result);
    onClose(); // close the sheet immediately — results now render on the dashboard, not here
  };

  const renderStep = () => {
    switch (step) {
      case 'greeting':
        return <GreetingStep name={profileName} onContinue={goNext} />;

      case 'gender':
        return (
          <GenderStep
            value={answers.gender}
            onChange={(gender) => updateAnswers({ gender })}
            onContinue={goNext}
          />
        );

      case 'age':
        return (
          <AgeStep
            value={answers.age}
            onChange={(age) => updateAnswers({ age })}
            onContinue={goNext}
          />
        );

      case 'routine':
        return (
          <RoutineStep
            value={answers.routine}
            onChange={(routine) => updateAnswers({ routine })}
            onContinue={goNext}
          />
        );

      case 'condition':
        return (
          <ConditionStep
            answer={answers.conditionAnswer}
            description={answers.conditionDescription}
            onAnswerChange={(conditionAnswer) =>
              updateAnswers({
                conditionAnswer,
                conditionDescription: conditionAnswer === 'yes' ? answers.conditionDescription : null,
              })
            }
            onDescriptionChange={(conditionDescription) => updateAnswers({ conditionDescription })}
            onContinue={goNext}
          />
        );

      case 'guidance-camera':
      case 'guidance-lighting':
      case 'guidance-distance':
      case 'guidance-look': {
        const content = GUIDANCE_CONTENT[step];
        return (
          <GuidanceStep
            icon={content.icon}
            title={content.title}
            body={content.body}
            onContinue={goNext}
          />
        );
      }

      case 'camera':
        return (
          <CameraStep
            onCaptured={(dataUrl) => {
              setCapturedImage(dataUrl);
              goNext();
            }}
            onQualityFail={handleQualityFail}
          />
        );

      case 'confirm':
        return capturedImage ? (
          <PhotoConfirmStep
            imageDataUrl={capturedImage}
            onRetake={() => {
              setCapturedImage(null);
              goToStep('camera');
            }}
            onAnalyze={goNext}
          />
        ) : null;

      case 'analyzing':
        return capturedImage ? (
          <AnalyzingStep
            profileId={profileId}
            imageDataUrl={capturedImage}
            answers={answers}
            onNoFace={handleNoFace}
            onSuccess={handleAnalysisSuccess}
          />
        ) : null;

      case 'complete':
        // Unreachable now — handleAnalysisSuccess closes the sheet directly
        // and results render on the dashboard via ProfileBody instead.
        return null;

      default:
        return null;
    }
  };

  return (
    <ScanOverlay onClose={onClose} onBack={goBack} showBack={showBack}>
      <Toast message={toastMessage} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </ScanOverlay>
  );
}
