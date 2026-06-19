'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SpeechRecognitionResult, EvaluationError, EvaluationErrorCode } from '@/lib/evaluate.types';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  error: EvaluationError | null;
  result: SpeechRecognitionResult | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

function mapErrorCode(error: string): EvaluationErrorCode {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'PERMISSION_DENIED';
    case 'network':
      return 'NETWORK_ERROR';
    case 'no-speech':
      return 'NO_SPEECH';
    case 'aborted':
    case 'audio-capture':
    case 'bad-grammar':
    case 'language-not-supported':
      return 'NOT_SUPPORTED';
    default:
      return 'UNKNOWN';
  }
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as Record<string, unknown>;
  return (
    (win.SpeechRecognition as SpeechRecognitionConstructor) ||
    (win.webkitSpeechRecognition as SpeechRecognitionConstructor) ||
    null
  );
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported] = useState(() => getSpeechRecognition() !== null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<EvaluationError | null>(null);
  const [result, setResult] = useState<SpeechRecognitionResult | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const hasResultRef = useRef(false);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    cleanup();
    setError(null);
    setResult(null);
    hasResultRef.current = false;

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError({ code: 'NOT_SUPPORTED', message: '' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setIsProcessing(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult) {
        const alternative = lastResult[0];
        const newResult: SpeechRecognitionResult = {
          transcript: alternative.transcript,
          confidence: alternative.confidence,
          isFinal: lastResult.isFinal,
        };
        setResult(prev => {
          if (prev && prev.transcript === newResult.transcript &&
              prev.confidence === newResult.confidence &&
              prev.isFinal === newResult.isFinal) return prev;
          return newResult;
        });
        if (lastResult.isFinal) {
          hasResultRef.current = true;
          setIsProcessing(true);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorCode = mapErrorCode(event.error);
      setError({ code: errorCode, message: '' });
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (!hasResultRef.current) {
        setError({ code: 'NO_SPEECH', message: '' });
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError({ code: 'UNKNOWN', message: '' });
    }
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecordingRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setIsProcessing(false);
    setError(null);
    setResult(null);
    hasResultRef.current = false;
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isSupported,
    isRecording,
    isProcessing,
    error,
    result,
    startRecording,
    stopRecording,
    reset,
  };
}
