import { parseWord } from './pinyin';
import type {
  EvaluationResult,
  SyllableResult,
  SyllableFeedback,
  EvaluationConfig,
  ConfusionPairs,
} from './evaluate.types';

const DEFAULT_CONFUSION_PAIRS: ConfusionPairs = {
  zh: ['z'], ch: ['c'], sh: ['s'],
  r: ['l'], n: ['l'], m: ['n'],
  b: ['p'], d: ['t'], g: ['k'],
  f: ['p'],
  j: ['zh'], q: ['ch'], x: ['sh'],
};

const DEFAULT_SIMILAR_FINALS: ConfusionPairs = {
  an: ['ang'], en: ['eng'], in: ['ing'],
  ian: ['iang'], uan: ['uang'],
  u: ['ü'], un: ['ün'], ue: ['üe'],
};

const DEFAULT_CONFIG: EvaluationConfig = {
  weights: { initial: 0.45, final: 0.45, tone: 0.1 },
  confusionPairs: DEFAULT_CONFUSION_PAIRS,
  similarFinals: DEFAULT_SIMILAR_FINALS,
};

const SCORE_EXACT = 100;
const SCORE_CONFUSION = 60;
const SCORE_SIMILAR_FINAL = 70;

function isInPairs(a: string, b: string, pairs: ConfusionPairs): boolean {
  if (a === b) return true;
  if (pairs[a]?.includes(b)) return true;
  if (pairs[b]?.includes(a)) return true;
  return false;
}

function calculateMatchScore(
  target: string,
  recognized: string,
  pairs: ConfusionPairs,
  partialScore: number,
): number {
  if (!target && !recognized) return SCORE_EXACT;
  if (!target || !recognized) return 0;
  if (target === recognized) return SCORE_EXACT;
  if (isInPairs(target, recognized, pairs)) return partialScore;
  return 0;
}

function addFeedback(
  issues: SyllableFeedback[],
  score: number,
  threshold: number,
  confusionKey: string,
  wrongKey: string,
  target: string,
  recognized: string | undefined,
) {
  if (score >= SCORE_EXACT || !recognized) return;
  issues.push({
    key: score === threshold ? confusionKey : wrongKey,
    params: { target, recognized },
  });
}

function generateSyllableFeedback(
  targetInitial: string,
  targetFinal: string,
  recognizedInitial: string | undefined,
  recognizedFinal: string | undefined,
  initialScore: number,
  finalScore: number,
  toneScore: number,
): SyllableFeedback[] {
  const issues: SyllableFeedback[] = [];

  addFeedback(issues, initialScore, SCORE_CONFUSION,
    'eval.feedbackInitialConfusion', 'eval.feedbackInitialWrong',
    targetInitial, recognizedInitial);

  addFeedback(issues, finalScore, SCORE_SIMILAR_FINAL,
    'eval.feedbackFinalConfusion', 'eval.feedbackFinalWrong',
    targetFinal, recognizedFinal);

  if (toneScore < SCORE_EXACT) {
    issues.push({ key: 'eval.feedbackTone' });
  }

  return issues;
}

function generateOverallFeedbackKey(totalScore: number): string {
  if (totalScore >= 90) return 'eval.feedbackOverallExcellent';
  if (totalScore >= 70) return 'eval.feedbackOverallGood';
  if (totalScore >= 50) return 'eval.feedbackOverallPractice';
  return 'eval.feedbackOverallNeedsWork';
}

export function evaluatePronunciation(
  targetWord: string,
  recognizedText: string,
  confidence: number,
  config: EvaluationConfig = DEFAULT_CONFIG,
): EvaluationResult {
  const targetSegments = parseWord(targetWord);
  const recognizedSegments = parseWord(recognizedText);
  const syllableResults: SyllableResult[] = [];

  const maxLength = Math.max(targetSegments.length, recognizedSegments.length);

  for (let i = 0; i < maxLength; i++) {
    const target = targetSegments[i];
    const recognized = recognizedSegments[i];

    const targetInitial = target?.initial || '';
    const targetFinal = target?.final || '';
    const targetTone = target?.tone || 1;
    const recognizedInitial = recognized?.initial || '';
    const recognizedFinal = recognized?.final || '';
    const recognizedTone = recognized?.tone || 1;

    const initialScore = calculateMatchScore(
      targetInitial, recognizedInitial, config.confusionPairs, SCORE_CONFUSION,
    );
    const finalScore = calculateMatchScore(
      targetFinal, recognizedFinal, config.similarFinals, SCORE_SIMILAR_FINAL,
    );
    const toneScore = targetTone === recognizedTone ? SCORE_EXACT : 50;

    const isCorrect = initialScore === SCORE_EXACT && finalScore === SCORE_EXACT && toneScore === SCORE_EXACT;

    const feedbackItems = generateSyllableFeedback(
      targetInitial, targetFinal,
      recognizedInitial, recognizedFinal,
      initialScore, finalScore, toneScore,
    );

    syllableResults.push({
      char: target?.char || '',
      pinyin: target?.pinyin || '',
      recognizedChar: recognized?.char || undefined,
      recognizedPinyin: recognized?.pinyin || undefined,
      isCorrect,
      initialScore,
      finalScore,
      toneScore,
      feedback: feedbackItems.length > 0 ? feedbackItems : undefined,
    });
  }

  let totalScore = 0;
  if (syllableResults.length > 0) {
    let sumI = 0, sumF = 0, sumT = 0;
    for (const r of syllableResults) {
      sumI += r.initialScore;
      sumF += r.finalScore;
      sumT += r.toneScore;
    }
    const count = syllableResults.length;
    totalScore = Math.round(
      (sumI / count) * config.weights.initial +
      (sumF / count) * config.weights.final +
      (sumT / count) * config.weights.tone,
    );
  }

  return {
    totalScore,
    syllableResults,
    feedback: generateOverallFeedbackKey(totalScore),
    recognizedText,
  };
}
