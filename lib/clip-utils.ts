import type { Locale } from "@/lib/i18n";
import type { Clip } from "@/lib/types";

export function getClipTitle(clip: Clip, locale: Locale): string {
  if (locale === "en") return clip.titleEn || clip.title;
  if (locale === "id") return clip.titleId || clip.title;
  return clip.title;
}

export function getClipFocus(clip: Clip, locale: Locale): string {
  if (locale === "en") return clip.focusEn || clip.focus;
  if (locale === "id") return clip.focusId || clip.focus;
  return clip.focus;
}
