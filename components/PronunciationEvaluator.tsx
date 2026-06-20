"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTTS } from "@/hooks/useTTS";
import { evaluatePronunciation } from "@/lib/evaluate";
import type { EvaluationResult, EvaluationErrorCode } from "@/lib/evaluate.types";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import SpeakerIcon from "@/components/SpeakerIcon";

interface PronunciationEvaluatorProps {
  targetWord: string;
  onEvaluationComplete?: (result: EvaluationResult) => void;
}

type EvaluatorState = "idle" | "recording" | "processing" | "error" | "completed";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const ERROR_I18N_KEYS: Record<EvaluationErrorCode, TranslationKey> = {
  PERMISSION_DENIED: "eval.errorPermission",
  NOT_SUPPORTED: "eval.errorNotSupported",
  NO_SPEECH: "eval.errorNoSpeech",
  NO_MATCH: "eval.errorNoSpeech",
  NETWORK_ERROR: "eval.errorNetwork",
  UNKNOWN: "eval.errorNotSupported",
};

function deriveState(evaluationResult: EvaluationResult | null, error: { code: string } | null, isProcessing: boolean, isRecording: boolean): EvaluatorState {
  if (evaluationResult) return "completed";
  if (error) return "error";
  if (isProcessing) return "processing";
  if (isRecording) return "recording";
  return "idle";
}

export default function PronunciationEvaluator({
  targetWord,
  onEvaluationComplete,
}: PronunciationEvaluatorProps) {
  const { t } = useI18n();
  const tts = useTTS();
  const {
    isSupported,
    isRecording,
    isProcessing,
    error,
    result: speechResult,
    startRecording,
    stopRecording,
    reset: resetSpeech,
  } = useSpeechRecognition();

  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (maxTimeRef.current) { clearTimeout(maxTimeRef.current); maxTimeRef.current = null; }
  }, []);

  useEffect(() => {
    if (isRecording) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
      maxTimeRef.current = setTimeout(() => stopRecording(), 10000);
    } else {
      clearTimers();
    }
    return clearTimers;
  }, [isRecording, stopRecording, clearTimers]);

  useEffect(() => {
    if (isProcessing && speechResult?.isFinal && !processedRef.current) {
      processedRef.current = true;
      const result = evaluatePronunciation(targetWord, speechResult.transcript, speechResult.confidence);
      setEvaluationResult(result);
      onEvaluationComplete?.(result);
    }
  }, [isProcessing, speechResult, targetWord, onEvaluationComplete]);

  const handleStartRecording = useCallback(async () => {
    setEvaluationResult(null);
    processedRef.current = false;
    await startRecording();
  }, [startRecording]);

  const handleRetry = useCallback(() => {
    resetSpeech();
    setEvaluationResult(null);
    setElapsedTime(0);
    processedRef.current = false;
  }, [resetSpeech]);

  const state = deriveState(evaluationResult, error, isProcessing, isRecording);
  const errorMessage = error ? t(ERROR_I18N_KEYS[error.code]) : "";
  const showTtsHint = Boolean(tts.lastError && tts.lastAttemptedText === targetWord);

  return (
    <div className="bg-surface border border-border rounded-lg p-5 sm:p-6">
      <div className="text-center mb-5">
        <h3 className="text-lg font-serif font-semibold text-text mb-1">{t("eval.title")}</h3>
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-text-muted">{t("eval.targetWord")}：<span className="font-medium text-text">{targetWord}</span></p>
          <div className="flex flex-col items-start gap-1">
            <button
              onClick={() => void tts.speak(targetWord)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              aria-label={`${t("eval.listenCorrect")}：${targetWord}`}
            >
              <SpeakerIcon />
              {t("eval.listenCorrect")}
            </button>
            {showTtsHint && (
              <p className="max-w-[220px] text-left text-xs text-text-muted leading-relaxed">
                {t("eval.ttsUnavailable")}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-text-muted mt-1">{t("eval.instruction")}</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {!isSupported && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md text-center" role="alert">
            <p className="text-yellow-800 text-sm">{t("eval.errorNotSupported")}</p>
          </div>
        )}

        {isSupported && state === "idle" && (
          <button
            onClick={handleStartRecording}
            className="w-48 h-12 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
            aria-label={t("eval.startRecording")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
              <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
            </svg>
            {t("eval.startRecording")}
          </button>
        )}

        {isSupported && state === "recording" && (
          <div className="flex flex-col items-center gap-3" aria-live="polite">
            <button
              onClick={stopRecording}
              className="w-48 h-12 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
              aria-label={t("eval.recording")}
            >
              <span className="w-3 h-3 bg-white rounded-sm" aria-hidden="true" />
              {t("eval.recording")}
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
              <span className="text-sm text-text-muted font-mono">{formatTime(elapsedTime)}</span>
            </div>
            <p className="text-xs text-text-muted">{t("eval.stopRecording")}</p>
          </div>
        )}

        {isSupported && state === "processing" && (
          <div className="w-48 h-12 bg-gray-200 text-gray-500 text-sm font-medium rounded-lg flex items-center justify-center gap-2" aria-live="polite">
            <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t("eval.processing")}
          </div>
        )}

        {isSupported && state === "error" && error && (
          <div className="flex flex-col items-center gap-3" role="alert">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md text-center">
              <p className="text-yellow-800 text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={handleRetry}
              className="h-10 px-6 bg-surface border border-border text-text text-sm font-medium rounded-lg hover:bg-background hover:border-primary hover:text-primary transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {t("eval.retry")}
            </button>
          </div>
        )}

        {isSupported && state === "completed" && evaluationResult && (
          <div className="w-full">
            <div className="text-center mb-4" aria-live="polite" role="status">
              <p className="text-3xl font-bold text-primary mb-1">
                {evaluationResult.totalScore}
                <span className="text-base font-normal text-text-muted"> / 100</span>
              </p>
              <p className="text-sm text-text-muted">{evaluationResult.feedback}</p>
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={handleRetry}
                className="h-10 px-6 bg-surface border border-border text-text text-sm font-medium rounded-lg hover:bg-background hover:border-primary hover:text-primary transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t("eval.retry")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
