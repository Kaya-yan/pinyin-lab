"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PinyinSegment, SubSegment } from "@/lib/pinyin";
import { useI18n, translateSubLabel } from "@/lib/i18n";

interface FlatSub {
  segIdx: number;
  subIdx: number;
  sub: SubSegment;
  pinyin: string;
}

interface VideoPlayerProps {
  segments: PinyinSegment[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

type Layer = "A" | "B";
type TransitionMode = "crossfade" | "hard-cut";

interface HandoffConfig {
  leadInMs: number;
  tailOutMs: number;
  blendMs: number;
  transitionMode: TransitionMode;
}

interface PendingHandoff {
  toFlatIdx: number;
  toLayer: Layer;
}

interface SegmentTimeline {
  initialFlatIdx: number;
  finalFlatIdx: number;
  initialDurationMs: number;
  finalDurationMs: number;
  initialWindowMs: number;
  totalMs: number;
}

const DEFAULT_SUB_DURATION_MS = 2000;
const DEFAULT_HANDOFF_CONFIG: HandoffConfig = {
  leadInMs: 120,
  tailOutMs: 160,
  blendMs: 120,
  transitionMode: "crossfade",
};
const SLOW_PLAYBACK_RATE = 0.5;
const CROSSFADE_MS = 150;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNextLayer(layer: Layer): Layer {
  return layer === "A" ? "B" : "A";
}

function getPlayableSrc(sub: SubSegment): { src: string | null; isGif: boolean; isVideo: boolean } {
  const src = sub.video || sub.gif || null;
  return {
    src,
    isGif: !sub.video && !!sub.gif,
    isVideo: !!sub.video,
  };
}

function getSubWallDurationMs(sub: SubSegment, isSlow: boolean): number {
  const duration = sub.durationMs || DEFAULT_SUB_DURATION_MS;
  return isSlow ? duration / SLOW_PLAYBACK_RATE : duration;
}

function getConfigWallDurationMs(durationMs: number, isSlow: boolean): number {
  return isSlow ? durationMs / SLOW_PLAYBACK_RATE : durationMs;
}

function getMediaSeekSeconds(wallMs: number, isSlow: boolean): number {
  const divisor = isSlow ? 1 / SLOW_PLAYBACK_RATE : 1;
  return Math.max(wallMs / divisor / 1000, 0);
}

function resolveHandoffConfig(currentSub: SubSegment, nextSub: SubSegment): HandoffConfig {
  const transitionMode = currentSub.transitionMode || nextSub.transitionMode || DEFAULT_HANDOFF_CONFIG.transitionMode;
  const leadInMs = nextSub.leadInMs || DEFAULT_HANDOFF_CONFIG.leadInMs;
  const tailOutMs = currentSub.tailOutMs || DEFAULT_HANDOFF_CONFIG.tailOutMs;
  const requestedBlendMs = currentSub.blendMs || nextSub.blendMs || DEFAULT_HANDOFF_CONFIG.blendMs;
  const blendMs = transitionMode === "hard-cut"
    ? 0
    : Math.min(requestedBlendMs, leadInMs, tailOutMs);

  return {
    leadInMs,
    tailOutMs,
    blendMs,
    transitionMode,
  };
}

function isIntraSyllableHandoff(current: FlatSub | undefined, next: FlatSub | null): next is FlatSub {
  return Boolean(
    current &&
    next &&
    current.segIdx === next.segIdx &&
    current.sub.phase === "initial" &&
    next.sub.phase === "final"
  );
}

export default function VideoPlayer({ segments, activeIndex, onIndexChange }: VideoPlayerProps) {
  const { t } = useI18n();
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const gifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handoffStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handoffAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handoffTriggeredRef = useRef(false);
  const pendingHandoffRef = useRef<PendingHandoff | null>(null);
  const queuedSeekRef = useRef<{ flatIdx: number; wallMs: number } | null>(null);
  const readyCleanupRef = useRef<(() => void) | null>(null);
  const currentLayerRef = useRef<Layer>("A");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeLayer, setActiveLayer] = useState<Layer>("A");
  const [layerASrc, setLayerASrc] = useState<string | null>(null);
  const [layerBSrc, setLayerBSrc] = useState<string | null>(null);
  const [layerAIsGif, setLayerAIsGif] = useState(false);
  const [layerBIsGif, setLayerBIsGif] = useState(false);
  const [layerAReady, setLayerAReady] = useState(false);
  const [layerBReady, setLayerBReady] = useState(false);
  const [flatIdx, setFlatIdx] = useState(0);

  const flatSubs = useMemo<FlatSub[]>(() => {
    const result: FlatSub[] = [];
    segments.forEach((seg, segIdx) => {
      if (seg.subs.length > 0) {
        seg.subs.forEach((sub, subIdx) => {
          result.push({ segIdx, subIdx, sub, pinyin: seg.pinyin });
        });
      } else {
        result.push({
          segIdx,
          subIdx: 0,
          sub: {
            label: seg.pinyin,
            video: null,
            gif: null,
            phase: "standalone",
            durationMs: DEFAULT_SUB_DURATION_MS,
          },
          pinyin: seg.pinyin,
        });
      }
    });
    return result;
  }, [segments]);

  const current = flatSubs[flatIdx];
  const nextSub = flatIdx < flatSubs.length - 1 ? flatSubs[flatIdx + 1] : null;

  function getVideoRef(layer: Layer) {
    return layer === "A" ? videoARef.current : videoBRef.current;
  }

  function setLayerReady(layer: Layer, ready: boolean) {
    if (layer === "A") {
      setLayerAReady(ready);
      return;
    }
    setLayerBReady(ready);
  }

  function setLayerSource(layer: Layer, src: string | null, isGif: boolean) {
    setLayerReady(layer, Boolean(src) && isGif);
    if (layer === "A") {
      setLayerASrc(src);
      setLayerAIsGif(isGif);
      return;
    }
    setLayerBSrc(src);
    setLayerBIsGif(isGif);
  }

  function clearTimers() {
    if (gifTimerRef.current) {
      clearTimeout(gifTimerRef.current);
      gifTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (handoffStartTimerRef.current) {
      clearTimeout(handoffStartTimerRef.current);
      handoffStartTimerRef.current = null;
    }
    if (handoffAdvanceTimerRef.current) {
      clearTimeout(handoffAdvanceTimerRef.current);
      handoffAdvanceTimerRef.current = null;
    }
    if (readyCleanupRef.current) {
      readyCleanupRef.current();
      readyCleanupRef.current = null;
    }
  }

  function pauseAllVideos() {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (videoA && !videoA.paused) videoA.pause();
    if (videoB && !videoB.paused) videoB.pause();
  }

  function getCharStartFlatIdx(segIdx: number) {
    return flatSubs.findIndex((item) => item.segIdx === segIdx);
  }

  function getSegmentTimeline(segIdx: number): SegmentTimeline | null {
    const segmentSubs = flatSubs.filter((item) => item.segIdx === segIdx);
    const initial = segmentSubs.find((item) => item.sub.phase === "initial");
    const final = segmentSubs.find((item) => item.sub.phase === "final");
    if (!initial || !final) return null;

    const handoff = resolveHandoffConfig(initial.sub, final.sub);
    const initialDurationMs = getSubWallDurationMs(initial.sub, isSlow);
    const finalDurationMs = getSubWallDurationMs(final.sub, isSlow);
    const overlapMs = handoff.transitionMode === "crossfade"
      ? getConfigWallDurationMs(handoff.blendMs, isSlow)
      : 0;
    const initialWindowMs = Math.max(initialDurationMs - overlapMs, 0);

    return {
      initialFlatIdx: flatSubs.findIndex((item) => item === initial),
      finalFlatIdx: flatSubs.findIndex((item) => item === final),
      initialDurationMs,
      finalDurationMs,
      initialWindowMs,
      totalMs: initialWindowMs + finalDurationMs,
    };
  }

  function computeProgressForCurrent(flatSub: FlatSub, elapsedWallMs: number) {
    const timeline = getSegmentTimeline(flatSub.segIdx);
    if (!timeline) {
      const total = getSubWallDurationMs(flatSub.sub, isSlow);
      return clamp((elapsedWallMs / total) * 100, 0, 100);
    }

    if (flatSub.sub.phase === "initial") {
      return clamp((elapsedWallMs / timeline.totalMs) * 100, 0, 100);
    }

    if (flatSub.sub.phase === "final") {
      return clamp(((timeline.initialWindowMs + elapsedWallMs) / timeline.totalMs) * 100, 0, 100);
    }

    const total = getSubWallDurationMs(flatSub.sub, isSlow);
    return clamp((elapsedWallMs / total) * 100, 0, 100);
  }

  function applyQueuedSeek(video: HTMLVideoElement | null) {
    const queuedSeek = queuedSeekRef.current;
    if (!video || !queuedSeek || queuedSeek.flatIdx !== flatIdx) return;

    const apply = () => {
      video.currentTime = getMediaSeekSeconds(queuedSeek.wallMs, isSlow);
      queuedSeekRef.current = null;
    };

    if (video.readyState >= 1) {
      apply();
      return;
    }

    const handleLoadedMetadata = () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      apply();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
  }

  function startCrossfadeHandoff(next: FlatSub, nextIdx: number, remainingWallMs: number, config: HandoffConfig) {
    const source = getPlayableSrc(next.sub);
    if (!source.src) return;

    const nextLayer = getNextLayer(currentLayerRef.current);
    pendingHandoffRef.current = { toFlatIdx: nextIdx, toLayer: nextLayer };
    setLayerSource(nextLayer, source.src, source.isGif);

    const activateLayer = () => {
      setActiveLayer(nextLayer);
      handoffAdvanceTimerRef.current = setTimeout(() => {
        setFlatIdx(nextIdx);
      }, Math.max(remainingWallMs, 0));
    };

    if (source.isVideo) {
      const nextVideo = getVideoRef(nextLayer);
      if (!nextVideo) return;

      nextVideo.pause();
      nextVideo.src = source.src;
      nextVideo.playbackRate = isSlow ? SLOW_PLAYBACK_RATE : 1;
      nextVideo.loop = false;
      nextVideo.load();

      const handleReady = () => {
        readyCleanupRef.current = null;
        nextVideo.removeEventListener("loadeddata", handleReady);
        setLayerReady(nextLayer, true);
        nextVideo.currentTime = getMediaSeekSeconds(config.leadInMs, isSlow);
        const playPromise = nextVideo.play();
        if (playPromise) playPromise.catch(() => {});
        activateLayer();
      };

      readyCleanupRef.current = () => {
        nextVideo.removeEventListener("loadeddata", handleReady);
      };

      if (nextVideo.readyState >= 2) {
        handleReady();
        return;
      }

      nextVideo.addEventListener("loadeddata", handleReady, { once: true });
      return;
    }

    activateLayer();
  }

  function switchImmediatelyToNext(next: FlatSub, nextIdx: number) {
    const source = getPlayableSrc(next.sub);
    if (!source.src) {
      setFlatIdx(nextIdx);
      return;
    }

    const nextLayer = getNextLayer(currentLayerRef.current);
    pendingHandoffRef.current = { toFlatIdx: nextIdx, toLayer: nextLayer };
    setLayerSource(nextLayer, source.src, source.isGif);

    if (source.isVideo) {
      const nextVideo = getVideoRef(nextLayer);
      if (nextVideo) {
        nextVideo.pause();
        nextVideo.src = source.src;
        nextVideo.playbackRate = isSlow ? SLOW_PLAYBACK_RATE : 1;
        nextVideo.loop = false;
        nextVideo.load();
        const playPromise = nextVideo.play();
        if (playPromise) playPromise.catch(() => {});
      }
    }

    setActiveLayer(nextLayer);
    setFlatIdx(nextIdx);
  }

  useEffect(() => {
    const idx = flatSubs.findIndex((item) => item.segIdx === activeIndex);
    if (idx >= 0 && current?.segIdx !== activeIndex) {
      clearTimers();
      pendingHandoffRef.current = null;
      handoffTriggeredRef.current = false;
      currentLayerRef.current = activeLayer;
      setFlatIdx(idx);
    }
  }, [activeIndex, flatSubs, current?.segIdx, activeLayer]);

  useEffect(() => {
    if (!current) return;

    clearTimers();
    handoffTriggeredRef.current = false;

    const playable = getPlayableSrc(current.sub);
    const handoffTarget = isIntraSyllableHandoff(current, nextSub) ? nextSub : null;
    const handoffConfig = handoffTarget ? resolveHandoffConfig(current.sub, handoffTarget.sub) : null;

    let layer = currentLayerRef.current;
    let adoptingPending = false;

    if (pendingHandoffRef.current?.toFlatIdx === flatIdx) {
      layer = pendingHandoffRef.current.toLayer;
      currentLayerRef.current = layer;
      pendingHandoffRef.current = null;
      adoptingPending = true;
    }

    if (!playable.src) {
      if (flatIdx < flatSubs.length - 1) {
        const timer = setTimeout(() => setFlatIdx(flatIdx + 1), 50);
        return () => clearTimeout(timer);
      }
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    if (playable.isGif) {
      pauseAllVideos();
      if (!adoptingPending) {
        setLayerSource(layer, playable.src, true);
      }
      setActiveLayer(layer);
      setIsPlaying(true);

      const durationMs = getSubWallDurationMs(current.sub, isSlow);
      const startTime = Date.now();

      progressIntervalRef.current = setInterval(() => {
        setProgress(computeProgressForCurrent(current, Date.now() - startTime));
      }, 100);

      if (handoffTarget && handoffConfig?.transitionMode === "crossfade") {
        const overlapMs = getConfigWallDurationMs(handoffConfig.blendMs, isSlow);
        handoffStartTimerRef.current = setTimeout(() => {
          if (!handoffTriggeredRef.current) {
            handoffTriggeredRef.current = true;
            startCrossfadeHandoff(handoffTarget, flatIdx + 1, overlapMs, handoffConfig);
          }
        }, Math.max(durationMs - overlapMs, 0));
      }

      gifTimerRef.current = setTimeout(() => {
        setProgress(computeProgressForCurrent(current, durationMs));
        if (handoffTarget) {
          if (pendingHandoffRef.current?.toFlatIdx === flatIdx + 1) {
            setFlatIdx(flatIdx + 1);
            return;
          }
          switchImmediatelyToNext(handoffTarget, flatIdx + 1);
          return;
        }
        if (isLoop) {
          const charStart = getCharStartFlatIdx(current.segIdx);
          setFlatIdx(charStart >= 0 ? charStart : flatIdx);
          return;
        }
        if (flatIdx < flatSubs.length - 1) {
          switchImmediatelyToNext(flatSubs[flatIdx + 1], flatIdx + 1);
          return;
        }
        setProgress(100);
        setIsPlaying(false);
      }, durationMs);

      return () => {
        clearTimers();
      };
    }

    const currentVideo = getVideoRef(layer);
    const preloadLayer = getNextLayer(layer);
    const preloadVideo = getVideoRef(preloadLayer);

    if (!currentVideo) return;

    if (!adoptingPending) {
      setLayerSource(layer, playable.src, false);
      setActiveLayer(layer);
      currentVideo.pause();
      currentVideo.src = playable.src;
      currentVideo.playbackRate = isSlow ? SLOW_PLAYBACK_RATE : 1;
      currentVideo.loop = false;
      currentVideo.load();

      const handleCurrentReady = () => {
        readyCleanupRef.current = null;
        currentVideo.removeEventListener("loadeddata", handleCurrentReady);
        setLayerReady(layer, true);
        applyQueuedSeek(currentVideo);
        const playPromise = currentVideo.play();
        if (playPromise) playPromise.catch(() => {});
        setIsPlaying(true);
      };

      readyCleanupRef.current = () => {
        currentVideo.removeEventListener("loadeddata", handleCurrentReady);
      };

      if (currentVideo.readyState >= 2) {
        handleCurrentReady();
      } else {
        currentVideo.addEventListener("loadeddata", handleCurrentReady, { once: true });
      }
    } else {
      setLayerReady(layer, true);
      setActiveLayer(layer);
      currentVideo.playbackRate = isSlow ? SLOW_PLAYBACK_RATE : 1;
      currentVideo.loop = false;
      applyQueuedSeek(currentVideo);
      if (currentVideo.paused) {
        const playPromise = currentVideo.play();
        if (playPromise) playPromise.catch(() => {});
      }
      setIsPlaying(true);
    }

    if (handoffTarget && preloadVideo) {
      const preloadSource = getPlayableSrc(handoffTarget.sub);
      if (preloadSource.isVideo && preloadSource.src) {
        preloadVideo.src = preloadSource.src;
        preloadVideo.preload = "auto";
        preloadVideo.load();
      }
    }

    const handleTimeUpdate = () => {
      if (!currentVideo.duration) return;
      const elapsedWallMs = (currentVideo.currentTime * 1000) / currentVideo.playbackRate;
      setProgress(computeProgressForCurrent(current, elapsedWallMs));

      if (!handoffTarget || !handoffConfig || handoffTriggeredRef.current) return;
      if (handoffConfig.transitionMode !== "crossfade") return;

      const overlapMs = getConfigWallDurationMs(handoffConfig.blendMs, isSlow);
      const remainingWallMs = ((currentVideo.duration - currentVideo.currentTime) * 1000) / currentVideo.playbackRate;
      if (remainingWallMs <= overlapMs) {
        handoffTriggeredRef.current = true;
        startCrossfadeHandoff(handoffTarget, flatIdx + 1, remainingWallMs, handoffConfig);
      }
    };

    const handleEnded = () => {
      if (handoffTarget) {
        if (pendingHandoffRef.current?.toFlatIdx === flatIdx + 1) {
          setFlatIdx(flatIdx + 1);
          return;
        }
        switchImmediatelyToNext(handoffTarget, flatIdx + 1);
        return;
      }
      if (isLoop) {
        const charStart = getCharStartFlatIdx(current.segIdx);
        setFlatIdx(charStart >= 0 ? charStart : flatIdx);
        return;
      }
      if (flatIdx < flatSubs.length - 1) {
        switchImmediatelyToNext(flatSubs[flatIdx + 1], flatIdx + 1);
        return;
      }
      setProgress(100);
      setIsPlaying(false);
    };

    currentVideo.addEventListener("timeupdate", handleTimeUpdate);
    currentVideo.addEventListener("ended", handleEnded);

    return () => {
      currentVideo.removeEventListener("timeupdate", handleTimeUpdate);
      currentVideo.removeEventListener("ended", handleEnded);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatIdx, current, nextSub, isSlow, isLoop, flatSubs.length]);

  useEffect(() => {
    if (current && current.segIdx !== activeIndex) {
      onIndexChange(current.segIdx);
    }
  }, [current, activeIndex, onIndexChange]);

  const togglePlay = () => {
    if (!current) return;

    if (isPlaying) {
      clearTimers();
      pauseAllVideos();
      setIsPlaying(false);
      return;
    }

    const playable = getPlayableSrc(current.sub);
    if (!playable.src) return;

    if (playable.isGif) {
      const layer = currentLayerRef.current;
      setIsPlaying(true);
      if (layer === "A") {
        setLayerASrc(null);
        requestAnimationFrame(() => setLayerASrc(current.sub.gif));
      } else {
        setLayerBSrc(null);
        requestAnimationFrame(() => setLayerBSrc(current.sub.gif));
      }

      const durationMs = getSubWallDurationMs(current.sub, isSlow);
      const handoffTarget = isIntraSyllableHandoff(current, nextSub) ? nextSub : null;
      const handoffConfig = handoffTarget ? resolveHandoffConfig(current.sub, handoffTarget.sub) : null;
      const startTime = Date.now();

      progressIntervalRef.current = setInterval(() => {
        setProgress(computeProgressForCurrent(current, Date.now() - startTime));
      }, 100);

      if (handoffTarget && handoffConfig?.transitionMode === "crossfade") {
        const overlapMs = getConfigWallDurationMs(handoffConfig.blendMs, isSlow);
        handoffStartTimerRef.current = setTimeout(() => {
          if (!handoffTriggeredRef.current) {
            handoffTriggeredRef.current = true;
            startCrossfadeHandoff(handoffTarget, flatIdx + 1, overlapMs, handoffConfig);
          }
        }, Math.max(durationMs - overlapMs, 0));
      }

      gifTimerRef.current = setTimeout(() => {
        if (handoffTarget) {
          if (pendingHandoffRef.current?.toFlatIdx === flatIdx + 1) {
            setFlatIdx(flatIdx + 1);
            return;
          }
          switchImmediatelyToNext(handoffTarget, flatIdx + 1);
          return;
        }
        if (isLoop) {
          const charStart = getCharStartFlatIdx(current.segIdx);
          setFlatIdx(charStart >= 0 ? charStart : flatIdx);
          return;
        }
        if (flatIdx < flatSubs.length - 1) {
          switchImmediatelyToNext(flatSubs[flatIdx + 1], flatIdx + 1);
          return;
        }
        setProgress(100);
        setIsPlaying(false);
      }, durationMs);
      return;
    }

    const currentVideo = getVideoRef(currentLayerRef.current);
    if (currentVideo) {
      currentVideo.playbackRate = isSlow ? SLOW_PLAYBACK_RATE : 1;
      const playPromise = currentVideo.play();
      if (playPromise) playPromise.catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleSlow = () => {
    const next = !isSlow;
    setIsSlow(next);
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (videoA) videoA.playbackRate = next ? SLOW_PLAYBACK_RATE : 1;
    if (videoB) videoB.playbackRate = next ? SLOW_PLAYBACK_RATE : 1;
  };

  const toggleLoop = () => {
    setIsLoop((prev) => !prev);
  };

  const handlePrev = () => {
    if (activeIndex > 0) onIndexChange(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < segments.length - 1) onIndexChange(activeIndex + 1);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const timeline = getSegmentTimeline(current.segIdx);

    if (!timeline || current.sub.phase === "standalone") {
      const currentVideo = getVideoRef(currentLayerRef.current);
      if (!currentVideo || !currentVideo.duration) return;
      currentVideo.currentTime = ratio * currentVideo.duration;
      return;
    }

    const targetWallMs = ratio * timeline.totalMs;
    const targetInitial = targetWallMs <= timeline.initialWindowMs;

    if (targetInitial) {
      const seekWallMs = Math.min(targetWallMs, timeline.initialDurationMs);
      if (flatIdx !== timeline.initialFlatIdx) {
        clearTimers();
        pendingHandoffRef.current = null;
        queuedSeekRef.current = { flatIdx: timeline.initialFlatIdx, wallMs: seekWallMs };
        currentLayerRef.current = getNextLayer(currentLayerRef.current);
        setFlatIdx(timeline.initialFlatIdx);
        return;
      }
      const currentVideo = getVideoRef(currentLayerRef.current);
      if (currentVideo) {
        currentVideo.currentTime = getMediaSeekSeconds(seekWallMs, isSlow);
        setProgress(computeProgressForCurrent(current, seekWallMs));
      }
      return;
    }

    const seekWallMs = Math.max(targetWallMs - timeline.initialWindowMs, 0);
    if (flatIdx !== timeline.finalFlatIdx) {
      clearTimers();
      pendingHandoffRef.current = null;
      queuedSeekRef.current = { flatIdx: timeline.finalFlatIdx, wallMs: seekWallMs };
      currentLayerRef.current = getNextLayer(currentLayerRef.current);
      setFlatIdx(timeline.finalFlatIdx);
      return;
    }

    const currentVideo = getVideoRef(currentLayerRef.current);
    if (currentVideo) {
      currentVideo.currentTime = getMediaSeekSeconds(seekWallMs, isSlow);
      setProgress(computeProgressForCurrent(current, seekWallMs));
    }
  };

  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!current) return;

    const timeline = getSegmentTimeline(current.segIdx);
    const currentVideo = getVideoRef(currentLayerRef.current);
    if (!timeline || !currentVideo || !currentVideo.duration) return;

    const stepMs = timeline.totalMs * 0.05;
    let nextWallMs: number | null = null;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        nextWallMs = (progress / 100) * timeline.totalMs + stepMs;
        break;
      case "ArrowLeft":
        e.preventDefault();
        nextWallMs = (progress / 100) * timeline.totalMs - stepMs;
        break;
      case "Home":
        e.preventDefault();
        nextWallMs = 0;
        break;
      case "End":
        e.preventDefault();
        nextWallMs = timeline.totalMs;
        break;
      default:
        break;
    }

    if (nextWallMs === null) return;

    const boundedWallMs = clamp(nextWallMs, 0, timeline.totalMs);
    const targetInitial = boundedWallMs <= timeline.initialWindowMs;

    if (targetInitial) {
      const seekWallMs = Math.min(boundedWallMs, timeline.initialDurationMs);
      if (flatIdx !== timeline.initialFlatIdx) {
        clearTimers();
        pendingHandoffRef.current = null;
        queuedSeekRef.current = { flatIdx: timeline.initialFlatIdx, wallMs: seekWallMs };
        currentLayerRef.current = getNextLayer(currentLayerRef.current);
        setFlatIdx(timeline.initialFlatIdx);
        return;
      }
      currentVideo.currentTime = getMediaSeekSeconds(seekWallMs, isSlow);
      setProgress(computeProgressForCurrent(current, seekWallMs));
      return;
    }

    const seekWallMs = Math.max(boundedWallMs - timeline.initialWindowMs, 0);
    if (flatIdx !== timeline.finalFlatIdx) {
      clearTimers();
      pendingHandoffRef.current = null;
      queuedSeekRef.current = { flatIdx: timeline.finalFlatIdx, wallMs: seekWallMs };
      currentLayerRef.current = getNextLayer(currentLayerRef.current);
      setFlatIdx(timeline.finalFlatIdx);
      return;
    }

    currentVideo.currentTime = getMediaSeekSeconds(seekWallMs, isSlow);
    setProgress(computeProgressForCurrent(current, seekWallMs));
  };

  if (!current) return null;

  const currentSeg = segments[current.segIdx];
  const hasSrc = (current.sub.video || current.sub.gif) !== null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-[800px] rounded-lg border border-border overflow-hidden bg-background">
        <div className="relative w-full aspect-video">
          {hasSrc ? (
            <>
              <div
                className="absolute inset-0 transition-opacity"
                style={{ opacity: activeLayer === "A" && layerAReady ? 1 : 0, transitionDuration: `${CROSSFADE_MS}ms` }}
              >
                {layerAIsGif ? (
                  layerASrc && (
                    <Image
                      src={layerASrc}
                      alt={`${current.pinyin} ${translateSubLabel(current.sub.label, t)} ${t("player.tongueGif")}`}
                      fill
                      unoptimized
                      sizes="(min-width: 800px) 800px, 100vw"
                      className="object-contain"
                    />
                  )
                ) : (
                  <video
                    ref={videoARef}
                    className="w-full h-full object-contain"
                    playsInline
                    preload="auto"
                    muted
                    aria-label={`${current.pinyin} ${translateSubLabel(current.sub.label, t)} ${t("player.tongueVideo")}`}
                  />
                )}
              </div>

              <div
                className="absolute inset-0 transition-opacity"
                style={{ opacity: activeLayer === "B" && layerBReady ? 1 : 0, transitionDuration: `${CROSSFADE_MS}ms` }}
              >
                {layerBIsGif ? (
                  layerBSrc && (
                    <Image
                      src={layerBSrc}
                      alt={`${current.pinyin} ${translateSubLabel(current.sub.label, t)} ${t("player.tongueGif")}`}
                      fill
                      unoptimized
                      sizes="(min-width: 800px) 800px, 100vw"
                      className="object-contain"
                    />
                  )
                ) : (
                  <video
                    ref={videoBRef}
                    className="w-full h-full object-contain"
                    playsInline
                    preload="auto"
                    muted
                    aria-label={`${current.pinyin} ${translateSubLabel(current.sub.label, t)} ${t("player.tongueVideo")}`}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-text-muted">
              <div className="text-center px-4">
                <p className="text-lg mb-2">{t("player.noVideo")}</p>
                <p className="text-sm">{t("player.noVideoDesc", { pinyin: current.pinyin })}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="w-full max-w-[800px] bg-surface border border-border rounded-lg px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3"
        role="toolbar"
        aria-label={t("player.toolbar")}
      >
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className="w-11 h-11 flex items-center justify-center text-secondary hover:text-primary disabled:opacity-30 transition-colors duration-150 rounded-sm"
          aria-label={t("player.prev")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={togglePlay}
          className="w-11 h-11 flex items-center justify-center text-secondary hover:text-primary transition-colors duration-150 rounded-sm"
          aria-label={isPlaying ? t("player.pause") : t("player.play")}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={activeIndex === segments.length - 1}
          className="w-11 h-11 flex items-center justify-center text-secondary hover:text-primary disabled:opacity-30 transition-colors duration-150 rounded-sm"
          aria-label={t("player.next")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        <div className="w-px h-6 bg-border mx-0.5 sm:mx-1" aria-hidden="true" />

        <button
          onClick={toggleLoop}
          className={`w-11 h-11 flex items-center justify-center rounded-sm transition-colors duration-150 ${
            isLoop ? "text-primary bg-highlight" : "text-secondary hover:text-primary"
          }`}
          aria-label={isLoop ? t("player.loopOn") : t("player.loopOff")}
          aria-pressed={isLoop}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </button>

        <button
          onClick={toggleSlow}
          className={`px-2.5 sm:px-3 h-11 flex items-center justify-center rounded-sm text-xs font-medium transition-colors duration-150 ${
            isSlow ? "text-primary bg-highlight" : "text-secondary hover:text-primary"
          }`}
          aria-label={isSlow ? t("player.slowOn") : t("player.slowOff")}
          aria-pressed={isSlow}
        >
          0.5x
        </button>

        <div className="flex-1 mx-1 sm:mx-2">
          <div
            className="relative h-1 bg-border rounded-full cursor-pointer group"
            onClick={handleProgressClick}
            onKeyDown={handleProgressKeyDown}
            role="slider"
            aria-label={t("player.progress")}
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
          >
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            {segments.map((_, i) => {
              if (i === 0) return null;
              const pct = (i / segments.length) * 100;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-accent"
                  style={{ left: `${pct}%` }}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        </div>

        <span className="text-xs text-text-muted whitespace-nowrap tabular-nums">
          {activeIndex + 1} / {segments.length}
        </span>
      </div>

      {currentSeg && current.sub.label && (
        <p className="text-sm text-text-muted text-center max-w-[800px] text-pretty">
          {t("player.nowPlaying")}<span className="text-primary font-medium">{current.pinyin}</span>
          {` · ${translateSubLabel(current.sub.label, t)}`}
        </p>
      )}
    </div>
  );
}
