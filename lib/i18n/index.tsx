"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Locale, TranslationKey } from "./types";
import { zh } from "./zh";
import { en } from "./en";
import { id } from "./id";

const STORAGE_KEY = "pinyinlab-locale";

const translations: Record<Locale, Record<TranslationKey, string>> = { zh, en, id };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && translations[stored]) {
        setLocaleState(stored);
      }
    } catch {
      // localStorage unavailable (privacy mode, third-party storage blocked)
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // localStorage unavailable
    }
    document.documentElement.lang = newLocale === "zh" ? "zh-CN" : newLocale;
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string>): string => {
      let text = translations[locale][key] || translations.zh[key] || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{${k}}`, v);
        }
      }
      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

export function translateSubLabel(
  label: string,
  t: (key: TranslationKey) => string
): string {
  return label
    .replace(/^声母/, t("term.initial"))
    .replace(/^韵母/, t("term.final"));
}

export type { Locale, TranslationKey };
