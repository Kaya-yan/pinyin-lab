"use client";

import Image from "next/image";
import type { Clip } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { getClipTitle } from "@/lib/clip-utils";

interface ClipCardProps {
  clip: Clip;
  onPreview: (clip: Clip) => void;
}

export default function ClipCard({ clip, onPreview }: ClipCardProps) {
  const { t, locale } = useI18n();
  const clipTitle = getClipTitle(clip, locale);

  return (
    <article className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* 封面 */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {clip.thumbnail ? (
          <Image
            src={clip.thumbnail}
            alt={clipTitle}
            fill
            unoptimized
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm text-center px-4">
            {clipTitle}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-sm tabular-nums">
          {clip.duration}
        </div>
      </div>

      {/* 信息区 */}
      <div className="p-4">
        <h3 className="text-base font-medium text-text mb-2 line-clamp-1">
          {clipTitle}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {clip.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium text-text-muted bg-gray-100 px-2 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => onPreview(clip)}
          className="w-full h-11 border border-primary text-primary text-sm font-medium rounded-sm bg-surface hover:bg-primary hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150"
          aria-label={`${t("clip.preview")} ${clipTitle}`}
        >
          {t("clip.preview")}
        </button>
      </div>
    </article>
  );
}
