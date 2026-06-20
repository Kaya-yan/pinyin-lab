"use client";

import { useCallback } from "react";
import type { EvaluationResult as EvaluationResultType, SyllableResult, SyllableFeedback } from "@/lib/evaluate.types";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { useTTS } from "@/hooks/useTTS";
import SpeakerIcon from "@/components/SpeakerIcon";

interface EvaluationResultProps {
  result: EvaluationResultType;
  onRetry?: () => void;
  onWatchVideo?: (syllable: SyllableResult) => void;
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function StarRating({ score, t }: { score: number; t: (key: TranslationKey) => string }) {
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
  const starLabel = stars === 3 ? t("eval.star3") : stars === 2 ? t("eval.star2") : t("eval.star1");

  return (
    <div className="flex flex-col items-center gap-1" aria-label={`${t("eval.stars")}：${stars} ${starLabel}`}>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <svg
            key={i}
            className={`w-8 h-8 ${i <= stars ? "text-yellow-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-medium text-text-muted">{starLabel}</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const percentage = Math.round(score);
  return (
    <div className="w-full bg-gray-100 rounded-full h-2" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(score)}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">{label}</span>
        <span className={`font-medium ${getScoreTextColor(score)}`}>{score}</span>
      </div>
      <ScoreBar score={score} />
    </>
  );
}

function FeedbackItem({ item, t }: { item: SyllableFeedback; t: (key: TranslationKey) => string }) {
  let message = t(item.key as TranslationKey);
  if (item.params) {
    for (const [k, v] of Object.entries(item.params)) {
      message = message.replace(`{${k}}`, v);
    }
  }
  return <span>{message}</span>;
}

function SyllableCard({ syllable, t, onListen, listenErrorText, showListenError }: {
  syllable: SyllableResult;
  t: (key: TranslationKey) => string;
  onListen?: (text: string) => void;
  listenErrorText?: string;
  showListenError?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-lg border transition-colors duration-200 ${
      syllable.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
    }`}>
      <div className="mb-2" aria-hidden="true">
        {syllable.isCorrect ? (
          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        )}
      </div>
      <span className="text-2xl font-bold text-text mb-1">{syllable.char}</span>
      <span className="text-sm text-text-muted mb-2">{syllable.pinyin}</span>
      {onListen && (
        <div className="mb-2 flex flex-col items-center gap-1">
          <button
            onClick={() => onListen(syllable.char)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            aria-label={`${t("eval.listenCorrect")}：${syllable.pinyin}`}
          >
            <SpeakerIcon />
            {t("eval.listenCorrect")}
          </button>
          {showListenError && listenErrorText && (
            <p className="max-w-[180px] text-center text-xs text-text-muted leading-relaxed">
              {listenErrorText}
            </p>
          )}
        </div>
      )}
      <div className="w-full space-y-2">
        <ScoreRow label={t("eval.initial")} score={syllable.initialScore} />
        <ScoreRow label={t("eval.final")} score={syllable.finalScore} />
        <ScoreRow label={t("eval.tone")} score={syllable.toneScore} />
      </div>
      {syllable.recognizedPinyin && syllable.recognizedPinyin !== syllable.pinyin && (
        <p className="text-xs text-text-muted mt-2">
          {t("eval.recognizedAs")}：<span className="font-medium">{syllable.recognizedPinyin}</span>
        </p>
      )}
      {syllable.feedback && syllable.feedback.length > 0 && (
        <div className="mt-2 space-y-1">
          {syllable.feedback.map((item, i) => (
            <p key={i} className="text-xs text-yellow-700 text-center leading-relaxed">
              <FeedbackItem item={item} t={t} />
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EvaluationResult({
  result,
  onRetry,
  onWatchVideo,
}: EvaluationResultProps) {
  const { t } = useI18n();
  const tts = useTTS();

  const correctCount = result.syllableResults.filter((r) => r.isCorrect).length;
  const totalCount = result.syllableResults.length;
  const errorFeedbacks = result.syllableResults.filter((s) => !s.isCorrect && s.feedback);
  const firstError = result.syllableResults.find((s) => !s.isCorrect);
  const fullWord = result.syllableResults.map((s) => s.char).join("");
  const ttsHint = t("eval.ttsUnavailable");

  const handleListenWord = useCallback((text: string) => {
    void tts.speak(text);
  }, [tts]);

  const handleListenAll = useCallback(() => {
    void tts.speak(fullWord);
  }, [tts, fullWord]);

  const getScoreLabel = () => {
    if (result.totalScore >= 90) return t("eval.excellent");
    if (result.totalScore >= 80) return t("eval.good");
    if (result.totalScore >= 60) return t("eval.pass");
    return t("eval.needsWork");
  };

  const renderOverallFeedback = () => {
    let msg = t(result.feedback as TranslationKey);
    const errorCount = totalCount - correctCount;
    if (msg.includes("{errorCount}")) {
      msg = msg.replace("{errorCount}", String(errorCount));
    }
    return msg;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-5 sm:p-6" role="region" aria-label={t("eval.result")}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-serif font-semibold text-text">{t("eval.result")}</h3>
        {onRetry && (
          <button
            onClick={onRetry}
            className="h-8 px-4 text-xs font-medium text-primary border border-primary/30 rounded-md hover:bg-primary/5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t("eval.retry")}
          </button>
        )}
      </div>

      <div className="text-center mb-6" aria-live="polite" role="status">
        <StarRating score={result.totalScore} t={t} />
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${getScoreTextColor(result.totalScore)}`}>
            {result.totalScore}/100 · {getScoreLabel()}
          </span>
          <span className="text-sm text-text-muted">
            {correctCount}/{totalCount} {t("eval.correctCount")}
          </span>
        </div>
      </div>

      {result.syllableResults.length > 0 && (
        <div className="mb-5">
          <div className="flex items-start justify-between mb-3 gap-3">
            <h4 className="text-sm font-medium text-text">{t("eval.syllableAnalysis")}</h4>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleListenAll}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                aria-label={t("eval.listenCorrect")}
              >
                <SpeakerIcon />
                {t("eval.listenCorrect")}
              </button>
              {tts.lastError && tts.lastAttemptedText === fullWord && (
                <p className="max-w-[220px] text-right text-xs text-text-muted leading-relaxed">
                  {ttsHint}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {result.syllableResults.map((syllable, index) => (
              <SyllableCard
                key={index}
                syllable={syllable}
                t={t}
                onListen={handleListenWord}
                listenErrorText={ttsHint}
                showListenError={Boolean(tts.lastError && tts.lastAttemptedText === syllable.char)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-background border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-text mb-2">{t("eval.feedback")}</h4>
        <p className="text-sm text-text-muted leading-relaxed">{renderOverallFeedback()}</p>

        {errorFeedbacks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <ul className="space-y-2">
              {errorFeedbacks.map((syllable, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-500 mt-0.5" aria-hidden="true">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-text-muted">
                    <span className="font-medium text-text">{syllable.char}</span>：
                    {syllable.feedback?.map((item, i) => (
                      <span key={i}><FeedbackItem item={item} t={t} />{i < syllable.feedback!.length - 1 ? "；" : ""}</span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-text-muted/70 text-center leading-relaxed">
        {t("eval.disclaimer")}
      </p>

      {result.totalScore < 70 && (
        <p className="mt-2 text-sm text-primary text-center font-medium">
          {t("eval.encourage1")}
        </p>
      )}

      {onWatchVideo && firstError && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => onWatchVideo(firstError)}
            className="h-10 px-6 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
            </svg>
            {t("eval.watchVideo")}
          </button>
        </div>
      )}
    </div>
  );
}
