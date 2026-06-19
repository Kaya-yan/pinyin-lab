"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import PinyinStrip from "@/components/PinyinStrip";
import VideoPlayer from "@/components/VideoPlayer";
import ClipCard from "@/components/ClipCard";
import BilibiliModal from "@/components/BilibiliModal";
import PronunciationEvaluator from "@/components/PronunciationEvaluator";
import EvaluationResult from "@/components/EvaluationResult";
import { parseWord } from "@/lib/pinyin";
import type { PinyinSegment } from "@/lib/pinyin";
import type { Clip } from "@/lib/types";
import type { EvaluationResult as EvaluationResultType, SyllableResult } from "@/lib/evaluate.types";
import clipsData from "@/data/clips.json";
import SearchIcon from "@/components/SearchIcon";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { useInView } from "@/lib/useInView";

function EmptyState({ t }: { t: (key: TranslationKey) => string }) {
  const { ref, inView } = useInView(0.2);
  return (
    <section ref={ref} className="flex flex-col items-center justify-center py-20 sm:py-28 text-center">
      <div className={`w-20 h-20 rounded-full bg-highlight flex items-center justify-center mb-5 ${inView ? "anim-scale-in" : "anim-hidden"}`} aria-hidden="true">
        <SearchIcon size={32} />
      </div>
      <h2 className={`text-xl font-serif font-semibold text-text mb-2 text-balance ${inView ? "anim-fade-up anim-delay-1" : "anim-hidden"}`}>
        {t("lab.emptyTitle")}
      </h2>
      <p className={`text-sm text-text-muted max-w-md text-pretty leading-relaxed ${inView ? "anim-fade-up anim-delay-2" : "anim-hidden"}`}>
        {t("lab.emptyDesc")}
      </p>
    </section>
  );
}

function LabContent() {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const wordParam = searchParams.get("word") || "";

  const [inputValue, setInputValue] = useState(wordParam);
  const [segments, setSegments] = useState<PinyinSegment[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [relatedClips, setRelatedClips] = useState<Clip[]>([]);
  const [previewClip, setPreviewClip] = useState<Clip | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResultType | null>(null);
  const videoSectionRef = useRef<HTMLElement | null>(null);

  const handleSearch = useCallback((word: string) => {
    if (!word.trim()) {
      setSegments([]);
      setRelatedClips([]);
      setEvaluationResult(null);
      return;
    }

    const result = parseWord(word.trim());
    setSegments(result);
    setActiveIndex(0);
    setEvaluationResult(null);

    const allTags = result.flatMap((s) => [s.initial, s.final]).filter(Boolean);
    const uniqueTags = Array.from(new Set(allTags));
    const matched = clipsData.clips.filter((clip) =>
      clip.tags.some((tag) => uniqueTags.includes(tag))
    );
    setRelatedClips(matched as Clip[]);
  }, []);

  useEffect(() => {
    if (wordParam) {
      setInputValue(wordParam);
      handleSearch(wordParam);
    }
  }, [wordParam, handleSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(inputValue);
    const url = new URL(window.location.href);
    url.searchParams.set("word", inputValue);
    window.history.replaceState({}, "", url.toString());
  };

  const handleEvaluationComplete = useCallback((result: EvaluationResultType) => {
    setEvaluationResult(result);
  }, []);

  const handleRetryEvaluation = useCallback(() => {
    setEvaluationResult(null);
  }, []);

  const handleWatchVideo = useCallback((syllable: SyllableResult) => {
    const segmentIndex = segments.findIndex((s) => s.char === syllable.char);
    if (segmentIndex >= 0) {
      setActiveIndex(segmentIndex);
      videoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [segments]);

  const currentWord = segments.map((s) => s.char).join("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="main-content" className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 搜索区 */}
        <section className="mb-6 sm:mb-8 bg-surface border border-border rounded-lg p-5 sm:p-6">
          <h1 className="sr-only">{t("lab.title")}</h1>
          <form onSubmit={handleSubmit} className="flex gap-3 justify-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("lab.inputPlaceholder")}
              maxLength={20}
              className="w-full max-w-96 h-12 sm:h-14 px-5 border border-border rounded-md text-base text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150"
              aria-label={t("lab.inputAriaLabel")}
            />
            <button
              type="submit"
              className="h-12 sm:h-14 px-6 sm:px-8 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150 whitespace-nowrap"
            >
              {t("lab.submit")}
            </button>
          </form>
        </section>

        {/* 拼音拆解条 */}
        {segments.length > 0 && (
          <section className="mb-6 sm:mb-8 bg-surface border border-border rounded-lg py-4 sm:py-6 px-4">
            <PinyinStrip
              segments={segments}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              evaluationResult={evaluationResult || undefined}
              onSyllableClick={handleWatchVideo}
            />
          </section>
        )}

        {/* 视频播放器 */}
        {segments.length > 0 && (
          <section ref={videoSectionRef} className="mb-8 sm:mb-10">
            <VideoPlayer
              segments={segments}
              activeIndex={activeIndex}
              onIndexChange={setActiveIndex}
            />
          </section>
        )}

        {/* 发音评测区 */}
        {segments.length > 0 && (
          <section className="mb-8 sm:mb-10">
            {evaluationResult ? (
              <EvaluationResult
                result={evaluationResult}
                onRetry={handleRetryEvaluation}
                onWatchVideo={handleWatchVideo}
              />
            ) : (
              <PronunciationEvaluator
                targetWord={currentWord}
                onEvaluationComplete={handleEvaluationComplete}
              />
            )}
          </section>
        )}

        {/* 空状态 */}
        {segments.length === 0 && (
          <EmptyState t={t} />
        )}

        {/* 关联片段推荐 */}
        {relatedClips.length > 0 && (
          <section>
            <h2 className="text-lg font-serif font-semibold text-text mb-4">
              {t("lab.relatedClips")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedClips.map((clip) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  onPreview={setPreviewClip}
                />
              ))}
            </div>
          </section>
        )}
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

export default function LabPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" aria-hidden="true" />
      </div>
    }>
      <LabContent />
    </Suspense>
  );
}
