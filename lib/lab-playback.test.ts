import { describe, expect, test } from "vitest";
import { derivePlaybackWord } from "./lab-playback";

describe("derivePlaybackWord", () => {
  test("keeps single-character input unchanged", () => {
    expect(derivePlaybackWord("你")).toEqual({
      displayWord: "你",
      playbackWord: "你",
      downgraded: false,
    });
  });

  test("keeps multi-character input visible but only plays the first character", () => {
    expect(derivePlaybackWord("你好")).toEqual({
      displayWord: "你好",
      playbackWord: "你",
      downgraded: true,
    });
  });

  test("trims whitespace before deriving the playback character", () => {
    expect(derivePlaybackWord("  水杯  ")).toEqual({
      displayWord: "水杯",
      playbackWord: "水",
      downgraded: true,
    });
  });

  test("returns an empty playback target for blank input", () => {
    expect(derivePlaybackWord("   ")).toEqual({
      displayWord: "",
      playbackWord: "",
      downgraded: false,
    });
  });
});
