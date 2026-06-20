"use client";

import { LanguageProvider, useI18n } from "@/lib/i18n";
import { useEffect, type ReactNode } from "react";

function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-sm focus:text-sm"
    >
      {t("skipToContent")}
    </a>
  );
}

function LangUpdater() {
  const { locale } = useI18n();
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
  }, [locale]);
  return null;
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <LangUpdater />
      <SkipLink />
      {children}
    </LanguageProvider>
  );
}
