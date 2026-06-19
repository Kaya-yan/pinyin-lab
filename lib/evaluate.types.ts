export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SyllableFeedback {
  key: string;
  params?: Record<string, string>;
}

export interface SyllableResult {
  char: string;
  pinyin: string;
  recognizedChar?: string;
  recognizedPinyin?: string;
  isCorrect: boolean;
  initialScore: number;
  finalScore: number;
  toneScore: number;
  feedback?: SyllableFeedback[];
}

export interface EvaluationResult {
  totalScore: number;
  syllableResults: SyllableResult[];
  feedback: string;
  recognizedText?: string;
}

export type EvaluationErrorCode =
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED'
  | 'NO_SPEECH'
  | 'NO_MATCH'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface EvaluationError {
  code: EvaluationErrorCode;
  message: string;
}

export type ConfusionPairs = Record<string, string[]>;

export interface ScoreWeights {
  initial: number;
  final: number;
  tone: number;
}

export interface EvaluationConfig {
  weights: ScoreWeights;
  confusionPairs: ConfusionPairs;
  similarFinals: ConfusionPairs;
}
