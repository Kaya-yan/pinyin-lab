import { pinyin } from "pinyin-pro";
import pinyinMap from "@/data/pinyinMap.json";

export type SubPhase = "initial" | "final" | "standalone";
export type TransitionMode = "crossfade" | "hard-cut";

export interface SubSegment {
  label: string;
  video: string | null;
  gif: string | null;
  phase: SubPhase;
  durationMs: number;
  leadInMs?: number;
  tailOutMs?: number;
  blendMs?: number;
  minVisibleMs?: number;
  transitionMode?: TransitionMode;
}

export interface PinyinSegment {
  char: string;
  pinyin: string;
  initial: string;
  final: string;
  tone: number;
  initialVideo: string | null;
  initialGif: string | null;
  finalVideo: string | null;
  subs: SubSegment[];
}

interface PinyinMapEntry {
  type: string;
  place?: string;
  video: string | null;
  gif?: string | null;
  duration: number;
  description: string;
  leadInMs?: number;
  tailOutMs?: number;
  blendMs?: number;
  minVisibleMs?: number;
  transitionMode?: TransitionMode;
}

const initialsList = [
  "zh", "ch", "sh",
  "b", "p", "m", "f", "d", "t", "n", "l",
  "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "y", "w",
];

const toneMap: Record<string, string> = {
  ā: "a", á: "a", ǎ: "a", à: "a",
  ē: "e", é: "e", ě: "e", è: "e",
  ī: "i", í: "i", ǐ: "i", ì: "i",
  ō: "o", ó: "o", ǒ: "o", ò: "o",
  ū: "u", ú: "u", ǔ: "u", ù: "u",
  ǖ: "ü", ǘ: "ü", ǚ: "ü", ǜ: "ü",
};

function stripTone(s: string): string {
  return s.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (ch) => toneMap[ch] || ch);
}

function canonicalizeAlias(k: string): string {
  if (k === "iou") return "iu";
  if (k === "uei") return "ui";
  if (k === "uen") return "un";
  if (k === "iu") return finalsMap["iou"] ? "iou" : k;
  if (k === "ui") return finalsMap["uei"] ? "uei" : k;
  if (k === "un") return finalsMap["uen"] ? "uen" : k;
  return k;
}

function normalizeFinal(key: string, initial: string): string {
  if ((initial === "j" || initial === "q" || initial === "x" || initial === "y") && key.startsWith("u")) {
    const withUmlaut = "ü" + key.slice(1);
    if (finalsMap[withUmlaut]) return withUmlaut;
  }
  if (initial === "y" && !key.startsWith("u") && !key.startsWith("ü") && key !== "i" && key !== "in" && key !== "ing") {
    const withI = "i" + key;
    if (finalsMap[withI]) return withI;
  }
  if (initial === "w" && key !== "u") {
    const withU = canonicalizeAlias("u" + key);
    if (finalsMap[withU]) return withU;
  }
  const canonical = canonicalizeAlias(key);
  if (canonical !== key && finalsMap[canonical]) return canonical;
  return key;
}

const initialsMap = pinyinMap.initials as Record<string, PinyinMapEntry>;
const finalsMap = pinyinMap.finals as Record<string, PinyinMapEntry>;

function createSubSegment(label: string, phase: SubPhase, entry: PinyinMapEntry): SubSegment {
  return {
    label,
    video: entry.video,
    gif: entry.gif || null,
    phase,
    durationMs: Math.round(entry.duration * 1000),
    leadInMs: entry.leadInMs,
    tailOutMs: entry.tailOutMs,
    blendMs: entry.blendMs,
    minVisibleMs: entry.minVisibleMs,
    transitionMode: entry.transitionMode,
  };
}

export function parseWord(word: string): PinyinSegment[] {
  const pinyinResult = pinyin(word, { type: "all", toneType: "symbol" });
  const segments: PinyinSegment[] = [];

  for (const item of pinyinResult) {
    if (!item.pinyin) continue;
    const py = item.pinyin;
    const initial = extractInitial(py);
    const finalRaw = py.slice(initial.length);
    const finalStripped = stripTone(finalRaw);
    const finalKey = normalizeFinal(finalStripped, initial);

    const initialData = initial ? initialsMap[initial] : null;
    const finalData = finalKey ? finalsMap[finalKey] : null;

    const subs: SubSegment[] = [];
    if (initialData) {
      subs.push(createSubSegment(`声母 ${initial}`, "initial", initialData));
    }
    if (finalData) {
      subs.push(createSubSegment(`韵母 ${finalKey}`, "final", finalData));
    }

    segments.push({
      char: item.origin || "",
      pinyin: py,
      initial,
      final: finalKey,
      tone: item.num || 1,
      initialVideo: initialData?.video || null,
      initialGif: initialData?.gif || null,
      finalVideo: finalData?.video || null,
      subs,
    });
  }

  return segments;
}

function extractInitial(py: string): string {
  for (const init of initialsList) {
    if (py.startsWith(init)) return init;
  }
  return "";
}

export function getInitials(): string[] {
  return Object.keys(pinyinMap.initials);
}

export function getFinals(): string[] {
  return Object.keys(pinyinMap.finals);
}

export function getVideoForPinyin(py: string): { video: string | null; gif: string | null; type: string } {
  const initialData = initialsMap[py];
  if (initialData) {
    return { video: initialData.video, gif: initialData.gif || null, type: initialData.type };
  }
  const finalData = finalsMap[py];
  if (finalData) {
    return { video: finalData.video, gif: null, type: finalData.type };
  }
  return { video: null, gif: null, type: "未知" };
}
