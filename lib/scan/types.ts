import type { SkinAnalysis } from '@/types/zadoc';

export type ScanStep =
  | 'greeting'
  | 'gender'
  | 'age'
  | 'routine'
  | 'condition'
  | 'guidance-camera'
  | 'guidance-lighting'
  | 'guidance-distance'
  | 'guidance-look'
  | 'camera'
  | 'confirm'
  | 'analyzing'
  | 'complete';

export type ScanGender = 'female' | 'male' | 'prefer_not_to_say';
export type ScanRoutine = 'none' | 'simple' | 'moderate' | 'detailed';
export type ScanConditionAnswer = 'no' | 'yes' | 'not_sure';

export interface ScanAnswers {
  gender: ScanGender | null;
  age: number | null;
  routine: ScanRoutine | null;
  conditionAnswer: ScanConditionAnswer | null;
  conditionDescription: string | null;
}

export const INITIAL_SCAN_ANSWERS: ScanAnswers = {
  gender: null,
  age: null,
  routine: null,
  conditionAnswer: null,
  conditionDescription: null,
};

// Ordered list of steps that make up the linear flow (guidance screens expand to 4).
export const SCAN_STEP_ORDER: ScanStep[] = [
  'greeting',
  'gender',
  'age',
  'routine',
  'condition',
  'guidance-camera',
  'guidance-lighting',
  'guidance-distance',
  'guidance-look',
  'camera',
  'confirm',
  'analyzing',
  'complete',
];

export interface AnalyzeApiResponse {
  face_detected: boolean;
  analysis: SkinAnalysis | null;
}

export interface ScanFlowProps {
  profileId: string;
  profileName: string;
  /** Called once the real Claude Vision analysis pipeline completes successfully. */
  onComplete: (analysis: SkinAnalysis) => void;
  /** Called when the user closes the flow before completion. */
  onClose: () => void;
}
