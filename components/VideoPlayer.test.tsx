import { render, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import VideoPlayer from "./VideoPlayer";
import { LanguageProvider } from "@/lib/i18n";
import type { PinyinSegment } from "@/lib/pinyin";

type MutableVideoState = {
  currentTime: number;
  duration: number;
  readyState: number;
  paused: boolean;
};

function installVideoState(video: HTMLVideoElement, state: MutableVideoState) {
  Object.defineProperty(video, "currentTime", {
    configurable: true,
    get: () => state.currentTime,
    set: (value: number) => {
      state.currentTime = value;
    },
  });
  Object.defineProperty(video, "duration", {
    configurable: true,
    get: () => state.duration,
  });
  Object.defineProperty(video, "readyState", {
    configurable: true,
    get: () => state.readyState,
  });
  Object.defineProperty(video, "paused", {
    configurable: true,
    get: () => state.paused,
  });

  video.play = vi.fn().mockImplementation(() => {
    state.paused = false;
    return Promise.resolve();
  });
  video.pause = vi.fn().mockImplementation(() => {
    state.paused = true;
  });
  video.load = vi.fn();
}

const segment: PinyinSegment = {
  char: "是",
  pinyin: "shì",
  initial: "sh",
  final: "i",
  tone: 4,
  initialVideo: "/videos/initials/sh.mov",
  initialGif: null,
  finalVideo: "/videos/finals/i.mp4",
  subs: [
    {
      label: "声母 sh",
      video: "/videos/initials/sh.mov",
      gif: null,
      phase: "initial",
      durationMs: 1010,
    },
    {
      label: "韵母 i",
      video: "/videos/finals/i.mp4",
      gif: null,
      phase: "final",
      durationMs: 2000,
    },
  ],
};

describe("VideoPlayer handoff timing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("keeps the initial layer visible until the next video has a renderable frame", async () => {
    const { container } = render(
      <LanguageProvider>
        <VideoPlayer segments={[segment]} activeIndex={0} onIndexChange={() => {}} />
      </LanguageProvider>
    );

    const videos = Array.from(container.querySelectorAll("video"));
    expect(videos).toHaveLength(2);

    const initialState: MutableVideoState = {
      currentTime: 0.9,
      duration: 1.01,
      readyState: 4,
      paused: false,
    };
    const finalState: MutableVideoState = {
      currentTime: 0,
      duration: 2,
      readyState: 0,
      paused: true,
    };

    installVideoState(videos[0], initialState);
    installVideoState(videos[1], finalState);

    const layers = Array.from(container.querySelectorAll(".absolute.inset-0"));
    expect(layers).toHaveLength(2);

    fireEvent.timeUpdate(videos[0]);

    expect((videos[1].play as unknown as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
    expect(layers[0]).toHaveStyle({ opacity: "1" });
    expect(layers[1]).toHaveStyle({ opacity: "0" });

    finalState.readyState = 4;
    fireEvent(videos[1], new Event("loadeddata"));

    await waitFor(() => {
      expect((videos[1].play as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalled();
      expect(layers[1]).toHaveStyle({ opacity: "1" });
    });
  });
});
