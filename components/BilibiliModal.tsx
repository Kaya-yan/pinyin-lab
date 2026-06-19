"use client";

import { useEffect, useRef } from "react";
import type { Clip } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { getClipTitle, getClipFocus } from "@/lib/clip-utils";

interface BilibiliModalProps {
  clip: Clip;
  onClose: () => void;
}

export default function BilibiliModal({ clip, onClose }: BilibiliModalProps) {
  const { t, locale } = useI18n();
  const clipTitle = getClipTitle(clip, locale);
  const clipFocus = getClipFocus(clip, locale);
  const closeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      if (e.key === "Tab") {
        const container = containerRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) onClose();
  };

  const embedUrl = `https://player.bilibili.com/player.html?bvid=${clip.bvid}&t=${clip.startTime}&danmaku=0&autoplay=1&high_quality=1`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-text/50 animate-[fade-in_0.2s_ease_forwards]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={clipTitle}
    >
      <div className="bg-surface rounded-lg border border-border w-full max-w-[880px] mx-4 max-h-[90vh] overflow-y-auto anim-scale-in">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-border">
          <h2 className="text-lg font-medium text-text pr-4 text-pretty">{clipTitle}</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-text transition-colors duration-150 rounded-sm flex-shrink-0 text-xl"
            aria-label={t("modal.close")}
          >
            &times;
          </button>
        </div>

        {/* B站播放器 */}
        <div className="px-5 sm:px-6 pt-4 sm:pt-5">
          <div className="aspect-video rounded-md overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
              scrolling="no"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              title={`${clipTitle} - ${t("modal.player")}`}
            />
          </div>
        </div>

        {/* 教学聚焦卡片 */}
        <div className="px-5 sm:px-6 py-4 sm:py-5">
          <div className="bg-background rounded-sm p-4 sm:p-5 border-l-[3px] border-accent">
            <h3 className="text-sm font-semibold text-accent mb-2">{t("modal.teachingFocus")}</h3>
            <p className="text-sm text-secondary leading-relaxed mb-3 text-pretty">
              {clipFocus}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs text-text-muted tabular-nums">
                {t("modal.startTime")}{formatTime(clip.startTime)}
              </span>
              <span className="text-xs text-text-muted">
                {t("modal.duration")}{clip.duration}
              </span>
            </div>
            <a
              href={`https://www.bilibili.com/video/${clip.bvid}?t=${clip.startTime}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-primary hover:underline transition-colors duration-150"
            >
              {t("modal.viewOnBilibili")} &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
