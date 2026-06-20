import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import PronunciationEvaluator from "./PronunciationEvaluator";
import EvaluationResult from "./EvaluationResult";
import PinyinStrip from "./PinyinStrip";
import { useTTS } from "@/hooks/useTTS";
import { LanguageProvider } from "@/lib/i18n";
import type { EvaluationResult as EvaluationResultType } from "@/lib/evaluate.types";
import type { PinyinSegment } from "@/lib/pinyin";

const TTS_HINT = "当前设备浏览器暂不支持中文朗读，请检查系统语音包或更换浏览器";

class FakeSpeechSynthesisUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event?: Event) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

function installSpeechSynthesis(options: {
  voices?: SpeechSynthesisVoice[];
  onSpeak?: (utterance: FakeSpeechSynthesisUtterance) => void;
} = {}) {
  const listeners = new Map<string, Set<() => void>>();
  const synth = {
    speaking: false,
    paused: false,
    pending: false,
    getVoices: vi.fn(() => options.voices ?? []),
    addEventListener: vi.fn((event: string, callback: () => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)?.add(callback);
    }),
    removeEventListener: vi.fn((event: string, callback: () => void) => {
      listeners.get(event)?.delete(callback);
    }),
    cancel: vi.fn(() => {
      synth.speaking = false;
    }),
    resume: vi.fn(() => {
      synth.paused = false;
    }),
    pause: vi.fn(() => {
      synth.paused = true;
    }),
    speak: vi.fn((utterance: FakeSpeechSynthesisUtterance) => {
      options.onSpeak?.(utterance);
    }),
  };

  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    writable: true,
    value: synth,
  });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    configurable: true,
    writable: true,
    value: FakeSpeechSynthesisUtterance,
  });

  return synth;
}

function removeSpeechSynthesis() {
  delete (window as Window & { speechSynthesis?: unknown }).speechSynthesis;
  delete (globalThis as typeof globalThis & { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance;
}

function renderWithLanguage(node: React.ReactNode) {
  return render(<LanguageProvider>{node}</LanguageProvider>);
}

function AvailabilityProbe({ text }: { text: string }) {
  const tts = useTTS() as ReturnType<typeof useTTS> & { availability?: string; speak: (value: string) => void };

  return (
    <div>
      <button onClick={() => tts.speak(text)}>speak</button>
      <span data-testid="availability">{tts.availability ?? "missing"}</span>
    </div>
  );
}

const result: EvaluationResultType = {
  totalScore: 72,
  feedback: "eval.feedbackOverallGood",
  syllableResults: [
    {
      char: "你",
      pinyin: "nǐ",
      isCorrect: true,
      initialScore: 100,
      finalScore: 100,
      toneScore: 50,
    },
  ],
};

const segment: PinyinSegment = {
  char: "你",
  pinyin: "nǐ",
  initial: "n",
  final: "i",
  tone: 3,
  initialVideo: null,
  initialGif: "/gif/initials/n.gif",
  finalVideo: "/videos/finals/i.mp4",
  subs: [],
};

describe("TTS compatibility feedback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
    removeSpeechSynthesis();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    removeSpeechSynthesis();
  });

  test("marks TTS availability as ready after speech starts successfully", async () => {
    installSpeechSynthesis({
      voices: [],
      onSpeak: (utterance) => {
        utterance.onstart?.();
        utterance.onend?.();
      },
    });

    renderWithLanguage(<AvailabilityProbe text="你" />);

    fireEvent.click(screen.getByRole("button", { name: "speak" }));

    await Promise.resolve();
    expect(screen.getByTestId("availability")).toHaveTextContent("ready");
  });

  test("keeps the listen button clickable and shows a fallback hint when TTS API is missing", async () => {
    renderWithLanguage(<PronunciationEvaluator targetWord="你" />);

    const listenButton = screen.getByRole("button", { name: /听正确发音：你/ });
    fireEvent.click(listenButton);

    await Promise.resolve();
    expect(screen.getByText(TTS_HINT)).toBeInTheDocument();
  });

  test("shows a fallback hint for evaluation playback when speech never starts", async () => {
    installSpeechSynthesis({
      voices: [],
      onSpeak: () => {},
    });

    renderWithLanguage(<EvaluationResult result={result} />);

    fireEvent.click(screen.getAllByRole("button", { name: /听正确发音/ })[0]);
    await vi.advanceTimersByTimeAsync(1600);

    expect(screen.getByText(TTS_HINT)).toBeInTheDocument();
  });

  test("still selects the syllable and shows a strip-level fallback hint when speech never starts", async () => {
    installSpeechSynthesis({
      voices: [],
      onSpeak: () => {},
    });
    const onSelect = vi.fn();

    renderWithLanguage(
      <PinyinStrip segments={[segment]} activeIndex={0} onSelect={onSelect} />
    );

    fireEvent.click(screen.getByRole("tab", { name: /nǐ/ }));
    await vi.advanceTimersByTimeAsync(1600);

    expect(onSelect).toHaveBeenCalledWith(0);
    expect(screen.getByText(TTS_HINT)).toBeInTheDocument();
  });
});
