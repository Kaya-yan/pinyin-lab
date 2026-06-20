'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const SPEAK_START_TIMEOUT_MS = 1500;
const ERROR_VISIBILITY_MS = 4000;

export type TTSAvailability = 'unsupported' | 'unknown' | 'ready' | 'failed';
export type TTSErrorCode = 'UNSUPPORTED' | 'UNAVAILABLE';

export interface TTSSpeakResult {
  ok: boolean;
  error?: TTSErrorCode;
}

export interface UseTTSReturn {
  isSupported: boolean;
  availability: TTSAvailability;
  isSpeaking: boolean;
  lastError: TTSErrorCode | null;
  lastAttemptedText: string | null;
  speak: (text: string, lang?: string) => Promise<TTSSpeakResult>;
  stop: () => void;
  clearError: () => void;
}

function hasSpeechSynthesisApi() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function findChineseVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const normalized = lang.toLowerCase();
  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalized) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith('zh')) ||
    null
  );
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => hasSpeechSynthesisApi());
  const [availability, setAvailability] = useState<TTSAvailability>(() => (hasSpeechSynthesisApi() ? 'unknown' : 'unsupported'));
  const [lastError, setLastError] = useState<TTSErrorCode | null>(null);
  const [lastAttemptedText, setLastAttemptedText] = useState<string | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(
    hasSpeechSynthesisApi() ? window.speechSynthesis : null,
  );
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearErrorTimer = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => {
    clearErrorTimer();
    setLastError(null);
  }, [clearErrorTimer]);

  const setTransientError = useCallback((error: TTSErrorCode, text: string) => {
    clearErrorTimer();
    setLastError(error);
    setLastAttemptedText(text);
    setAvailability((prev) => (prev === 'unsupported' ? prev : 'failed'));
    errorTimerRef.current = setTimeout(() => {
      setLastError(null);
      errorTimerRef.current = null;
    }, ERROR_VISIBILITY_MS);
  }, [clearErrorTimer]);

  const refreshVoices = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) {
      voicesRef.current = [];
      setAvailability('unsupported');
      return [] as SpeechSynthesisVoice[];
    }

    const voices = synth.getVoices();
    voicesRef.current = voices;
    setAvailability(findChineseVoice(voices, 'zh-CN') ? 'ready' : 'unknown');
    return voices;
  }, []);

  useEffect(() => {
    const synth = synthRef.current;
    if (!synth) return;

    refreshVoices();
    synth.addEventListener('voiceschanged', refreshVoices);
    return () => {
      synth.removeEventListener('voiceschanged', refreshVoices);
      synth.cancel();
      clearErrorTimer();
    };
  }, [clearErrorTimer, refreshVoices]);

  const speak = useCallback(async (text: string, lang = 'zh-CN'): Promise<TTSSpeakResult> => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return { ok: false, error: 'UNAVAILABLE' };
    }

    setLastAttemptedText(trimmedText);
    clearError();

    const synth = synthRef.current;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      setAvailability('unsupported');
      setIsSpeaking(false);
      setTransientError('UNSUPPORTED', trimmedText);
      return { ok: false, error: 'UNSUPPORTED' };
    }

    const voices = refreshVoices();
    const utterance = new SpeechSynthesisUtterance(trimmedText);
    const voice = findChineseVoice(voices, lang);

    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;

    synth.cancel();
    if (synth.paused) synth.resume();

    return new Promise<TTSSpeakResult>((resolve) => {
      let started = false;
      let settled = false;

      const finish = (result: TTSSpeakResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(startTimeout);
        resolve(result);
      };

      const fail = () => {
        setIsSpeaking(false);
        setTransientError('UNAVAILABLE', trimmedText);
        finish({ ok: false, error: 'UNAVAILABLE' });
      };

      utterance.onstart = () => {
        started = true;
        clearError();
        setAvailability('ready');
        setIsSpeaking(true);
        finish({ ok: true });
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (!started) fail();
      };

      utterance.onerror = () => {
        fail();
      };

      const startTimeout = setTimeout(() => {
        if (!started) {
          synth.cancel();
          fail();
        }
      }, SPEAK_START_TIMEOUT_MS);

      try {
        synth.speak(utterance);
      } catch {
        clearTimeout(startTimeout);
        fail();
      }
    });
  }, [clearError, refreshVoices, setTransientError]);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isSupported,
    availability,
    isSpeaking,
    lastError,
    lastAttemptedText,
    speak,
    stop,
    clearError,
  };
}
