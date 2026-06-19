"use client";

import { useI18n, type Locale } from "@/lib/i18n";
import { useState, useRef, useEffect } from "react";

const LANGUAGES: { code: Locale; label: string; short: string }[] = [
  { code: "zh", label: "中文", short: "中" },
  { code: "en", label: "English", short: "EN" },
  { code: "id", label: "Bahasa Indonesia", short: "ID" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === locale)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-11 px-3 text-sm font-medium text-secondary hover:text-primary transition-colors rounded-sm"
        aria-label={t("nav.changeLang")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="tabular-nums">{current.short}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg py-1 min-w-[180px] z-50"
          role="listbox"
          aria-label={t("nav.changeLang")}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={locale === lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-highlight transition-colors flex items-center justify-between ${
                locale === lang.code ? "text-primary font-medium" : "text-text"
              }`}
            >
              <span>{lang.label}</span>
              {locale === lang.code && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
