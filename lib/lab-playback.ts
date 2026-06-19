export interface PlaybackWordInfo {
  displayWord: string;
  playbackWord: string;
  downgraded: boolean;
}

export function derivePlaybackWord(input: string): PlaybackWordInfo {
  const displayWord = input.trim();
  if (!displayWord) {
    return {
      displayWord: "",
      playbackWord: "",
      downgraded: false,
    };
  }

  const chars = Array.from(displayWord);
  return {
    displayWord,
    playbackWord: chars[0],
    downgraded: chars.length > 1,
  };
}
