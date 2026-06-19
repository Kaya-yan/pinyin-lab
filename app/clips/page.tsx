"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ClipCard from "@/components/ClipCard";
import BilibiliModal from "@/components/BilibiliModal";
import { getInitials, getFinals } from "@/lib/pinyin";
import { useI18n } from "@/lib/i18n";
import type { Clip } from "@/lib/types";
import clipsData from "@/data/clips.json";

const initials = getInitials();
const finals = getFinals();

function filterButtonClass(isActive: boolean, isFinal: boolean) {
  const sizing = isFinal
    ? "min-w-11 h-11 sm:min-w-12 sm:h-12 px-2 sm:px-3"
    : "min-w-11 h-11 sm:min-w-12 sm:h-12 px-2";
  const base = "flex items-center justify-center rounded-md text-sm sm:text-base font-medium transition-all duration-200";
  const state = isActive
    ? "bg-primary text-white"
    : "bg-surface border border-border text-secondary hover:border-primary hover:text-primary";
  return `${sizing} ${base} ${state}`;
}

export default function ClipsPage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [previewClip, setPreviewClip] = useState<Clip | null>(null);
  const { t } = useI18n();

  const filteredClips = activeFilter
    ? clipsData.clips.filter((clip) => clip.tags.includes(activeFilter))
    : clipsData.clips;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="main-content" className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-semibold text-text mb-1 text-balance">{t("clips.title")}</h1>
          <p className="text-sm text-text-muted">{t("clips.subtitle")}</p>
        </div>

        {/* 拼音字母网格 */}
        <section className="mb-6 sm:mb-8 bg-surface border border-border rounded-lg p-4 sm:p-6">
          <h2 className="text-sm font-medium text-text-muted mb-3">{t("clips.initials")}</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-5" role="group" aria-label={t("clips.initialsAria")}>
            {initials.map((py) => (
              <button
                key={py}
                onClick={() => setActiveFilter(activeFilter === py ? null : py)}
                className={filterButtonClass(activeFilter === py, false)}
                aria-pressed={activeFilter === py}
              >
                {py}
              </button>
            ))}
          </div>

          <h2 className="text-sm font-medium text-text-muted mb-3">{t("clips.finals")}</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label={t("clips.finalsAria")}>
            {finals.map((py) => (
              <button
                key={py}
                onClick={() => setActiveFilter(activeFilter === py ? null : py)}
                className={filterButtonClass(activeFilter === py, true)}
                aria-pressed={activeFilter === py}
              >
                {py}
              </button>
            ))}
          </div>

          {/* 清除筛选 */}
          {activeFilter && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
              <span className="text-sm text-text-muted">
                {t("clips.currentFilter")}<span className="text-primary font-medium">{activeFilter}</span>
              </span>
              <button
                onClick={() => setActiveFilter(null)}
                className="text-sm text-primary hover:underline transition-colors duration-150"
              >
                {t("clips.clearFilter")}
              </button>
            </div>
          )}
        </section>

        {/* 片段列表 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold text-text text-balance">
              {activeFilter
                ? `"${activeFilter}" ${t("clips.filteredTitle")}`
                : t("clips.allClips")}
            </h2>
            <span className="text-sm text-text-muted tabular-nums">
              {filteredClips.length} {t("clips.clipCount")}
            </span>
          </div>

          {filteredClips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredClips.map((clip) => (
                <ClipCard
                  key={clip.id}
                  clip={clip as Clip}
                  onPreview={setPreviewClip}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-text-muted">{t("clips.noResults")}</p>
            </div>
          )}
        </section>
      </main>

      {/* B站预览弹窗 */}
      {previewClip && (
        <BilibiliModal
          clip={previewClip}
          onClose={() => setPreviewClip(null)}
        />
      )}
    </div>
  );
}
