"use client";

import { useCallback } from "react";
import type { PinyinSegment } from "@/lib/pinyin";
import type { EvaluationResult, SyllableResult } from "@/lib/evaluate.types";
import { useI18n } from "@/lib/i18n";
import { useTTS } from "@/hooks/useTTS";

interface PinyinStripProps {
  segments: PinyinSegment[];
  activeIndex: number;
  onSelect: (index: number) => void;
  evaluationResult?: EvaluationResult;
  onSyllableClick?: (syllable: SyllableResult) => void;
}

const EVAL_CARD_STYLES = {
  correct_active: "bg-green-50 border-2 border-green-500 text-green-700",
  correct_inactive: "bg-green-50 border border-green-300 text-green-700 hover:border-green-500",
  incorrect_active: "bg-red-50 border-2 border-red-500 text-red-700",
  incorrect_inactive: "bg-red-50 border border-red-300 text-red-700 hover:border-red-500",
  active: "bg-highlight border-2 border-primary text-primary",
  inactive: "bg-surface border border-border text-text-muted hover:border-primary hover:text-primary",
} as const;

function EvaluationBadge({ isCorrect, labelCorrect, labelNeedsImprovement }: {
  isCorrect: boolean;
  labelCorrect: string;
  labelNeedsImprovement: string;
}) {
  if (isCorrect) {
    return (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" aria-label={labelCorrect}>
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" aria-label={labelNeedsImprovement}>
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </span>
  );
}

export default function PinyinStrip({
  segments,
  activeIndex,
  onSelect,
  evaluationResult,
  onSyllableClick,
}: PinyinStripProps) {
  const { t } = useI18n();
  const tts = useTTS();

  const handleSyllableClick = useCallback((index: number, seg: PinyinSegment, syllable?: SyllableResult) => {
    onSelect(index);
    if (syllable && onSyllableClick) onSyllableClick(syllable);
    if (tts.isSupported) tts.speak(seg.char);
  }, [onSelect, onSyllableClick, tts]);

  if (segments.length === 0) return null;

  const syllableResults = evaluationResult?.syllableResults;
  const correctCount = syllableResults ? syllableResults.filter((r) => r.isCorrect).length : 0;
  const incorrectCount = syllableResults ? syllableResults.length - correctCount : 0;

  const getCardClasses = (index: number, isActive: boolean) => {
    const syllable = syllableResults?.[index];
    if (syllable) {
      if (syllable.isCorrect) return isActive ? EVAL_CARD_STYLES.correct_active : EVAL_CARD_STYLES.correct_inactive;
      return isActive ? EVAL_CARD_STYLES.incorrect_active : EVAL_CARD_STYLES.incorrect_inactive;
    }
    return isActive ? EVAL_CARD_STYLES.active : EVAL_CARD_STYLES.inactive;
  };

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <div className="flex items-center gap-3" aria-label={t("strip.character")}>
        {segments.map((seg, i) => {
          const syllable = syllableResults?.[i];
          let charColor = i === activeIndex ? "text-primary" : "text-text";
          if (syllable) charColor = syllable.isCorrect ? "text-green-700" : "text-red-700";
          return (
            <span key={`char-${i}`} className={`text-[28px] font-medium transition-colors duration-150 ${charColor}`}>
              {seg.char}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-center" role="tablist" aria-label={t("strip.syllables")}>
        {segments.map((seg, i) => {
          const isActive = i === activeIndex;
          const syllable = syllableResults?.[i];
          const baseLabel = `${seg.pinyin}，${isActive ? t("strip.nowPlaying") : t("strip.clickToPlay")}`;
          const evalLabel = syllable ? `，${syllable.isCorrect ? t("eval.correct") : t("eval.needsImprovement")}` : "";
          return (
            <button
              key={`py-${i}`}
              onClick={() => handleSyllableClick(i, seg, syllable)}
              role="tab"
              aria-selected={isActive}
              aria-label={`${baseLabel}${evalLabel}`}
              className={`relative flex flex-col items-center justify-center min-w-24 h-20 px-6 rounded-lg transition-all duration-200 cursor-pointer ${getCardClasses(i, isActive)}`}
            >
              {syllable && (
                <EvaluationBadge
                  isCorrect={syllable.isCorrect}
                  labelCorrect={t("eval.correct")}
                  labelNeedsImprovement={t("eval.needsImprovement")}
                />
              )}
              <span className="text-[56px] font-bold leading-none tracking-tight">{seg.pinyin}</span>
              <span className="text-xs font-medium mt-1 opacity-60">
                {seg.initial && seg.final ? `${seg.initial} · ${seg.final}` : seg.initial || seg.final}
              </span>
            </button>
          );
        })}
      </div>

      {syllableResults && (
        <div className="flex items-center gap-4 text-xs text-text-muted" aria-live="polite">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true" />
            {t("eval.correct")} {correctCount}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full" aria-hidden="true" />
            {t("eval.needsImprovement")} {incorrectCount}
          </span>
        </div>
      )}
    </div>
  );
}
