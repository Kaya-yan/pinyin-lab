"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useI18n, type TranslationKey } from "@/lib/i18n";

function ProductMockup({ t }: { t: (key: TranslationKey) => string }) {
  return (
    <div className="w-full max-w-[540px] mx-auto bg-surface rounded-lg border border-border overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl font-medium text-text-muted">汉</span>
          <span className="text-xl font-medium text-text-muted">语</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center min-w-[90px] px-4 py-3 rounded-md bg-highlight border-2 border-primary text-primary">
            <span className="text-2xl font-bold leading-none">h</span>
            <span className="text-[10px] mt-1 opacity-70">{t("term.initial")}</span>
          </div>
          <div className="flex flex-col items-center min-w-[90px] px-4 py-3 rounded-md bg-surface border border-border text-text-muted">
            <span className="text-2xl font-bold leading-none">an</span>
            <span className="text-[10px] mt-1 opacity-70">{t("term.final")}</span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5 pt-5">
        <div className="relative rounded-md overflow-hidden bg-black border border-border aspect-video">
          <Image
            src="/gif/initials/h.gif"
            alt={t("player.tongueGif")}
            fill
            unoptimized
            priority
            sizes="(min-width: 1024px) 540px, 100vw"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  toneClass,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  toneClass: string;
}) {
  return (
    <article className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className={`h-28 flex items-center justify-center border-b border-border ${toneClass}`}>
        {icon}
      </div>
      <div className="p-5 text-center">
        <h2 className="text-base font-serif font-semibold text-text mb-2">{title}</h2>
        <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
      </div>
    </article>
  );
}

function TongueVisual() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" aria-hidden="true">
      <ellipse cx="40" cy="35" rx="28" ry="18" stroke="#2C5282" strokeWidth="2" fill="#EBF4FF" />
      <path d="M18 45 Q30 22 55 32 Q65 36 62 45" fill="white" stroke="#B7791F" strokeWidth="2" />
      <circle cx="48" cy="28" r="3" fill="#2C5282" opacity="0.4" />
      <path d="M42 20 L50 16" stroke="#2C5282" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M47 13 L50 16 L47 19" stroke="#2C5282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClipsVisual() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="70" height="50" rx="6" stroke="#2C5282" strokeWidth="2" fill="#EBF4FF" />
      <rect x="12" y="14" width="22" height="16" rx="3" fill="white" stroke="#2C5282" strokeWidth="1.5" />
      <path d="M20 19v6l6-3-6-3z" fill="#2C5282" />
      <rect x="40" y="14" width="22" height="16" rx="3" fill="white" stroke="#2C5282" strokeWidth="1.5" />
      <path d="M48 19v6l6-3-6-3z" fill="#B7791F" />
      <rect x="12" y="36" width="22" height="12" rx="2" fill="white" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="40" y="36" width="22" height="12" rx="2" fill="white" stroke="#E2E8F0" strokeWidth="1" />
    </svg>
  );
}

function GlobeVisual() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" aria-hidden="true">
      <circle cx="40" cy="30" r="22" stroke="#2C5282" strokeWidth="2" fill="#EBF4FF" />
      <ellipse cx="40" cy="30" rx="10" ry="22" stroke="#2C5282" strokeWidth="1.5" fill="none" />
      <line x1="18" y1="30" x2="62" y2="30" stroke="#2C5282" strokeWidth="1.5" />
      <line x1="40" y1="8" x2="40" y2="52" stroke="#2C5282" strokeWidth="1.5" />
      <text x="27" y="27" fontSize="10" fontWeight="bold" fill="#2C5282" fontFamily="serif">中</text>
      <text x="47" y="27" fontSize="9" fontWeight="bold" fill="#B7791F" fontFamily="sans-serif">EN</text>
      <text x="35" y="44" fontSize="9" fontWeight="bold" fill="#4A5568" fontFamily="sans-serif">ID</text>
    </svg>
  );
}

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="main-content">
        <section className="max-w-[1040px] mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-text leading-tight mb-5 text-balance">
                {t("landing.heroTitle")}
              </h1>
              <p className="text-base sm:text-lg text-text-muted max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
                {t("landing.heroSubtitle")}
              </p>
              <Link
                href="/lab"
                className="inline-flex items-center justify-center h-12 sm:h-14 px-8 sm:px-10 bg-primary text-white text-base font-medium rounded-md hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150"
              >
                {t("landing.cta")}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div>
              <ProductMockup t={t} />
            </div>
          </div>
        </section>

        <section className="bg-surface border-t border-b border-border">
          <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <FeatureCard
                icon={<TongueVisual />}
                title={t("landing.feature1Title")}
                desc={t("landing.feature1Desc")}
                toneClass="bg-highlight"
              />
              <FeatureCard
                icon={<ClipsVisual />}
                title={t("landing.feature2Title")}
                desc={t("landing.feature2Desc")}
                toneClass="bg-background"
              />
              <FeatureCard
                icon={<GlobeVisual />}
                title={t("landing.feature3Title")}
                desc={t("landing.feature3Desc")}
                toneClass="bg-surface"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
