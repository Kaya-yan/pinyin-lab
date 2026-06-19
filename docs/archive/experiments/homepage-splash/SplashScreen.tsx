"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const completedRef = useRef(false);
  const maskRef = useRef<HTMLDivElement>(null);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
    setVisible(false);
  }, [onComplete]);

  // Auto-complete when mask-expand animation finishes
  useEffect(() => {
    const mask = maskRef.current;
    if (!mask) return;
    const onEnd = () => handleComplete();
    mask.addEventListener("animationend", onEnd);
    return () => mask.removeEventListener("animationend", onEnd);
  }, [handleComplete]);

  // Any key press skips the splash
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) handleComplete();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, handleComplete]);

  if (!visible) return null;

  return (
    <div className="splash-screen" onClick={handleComplete}>
      <div className="splash-gradient" />
      <div className="splash-decorations" />
      <div className="splash-content">
        <div className="splash-brand">PINYINLAB</div>
        <div className="splash-divider" />
        <div className="splash-subtitle">看得见的发音</div>
      </div>
      <div className="splash-mask" ref={maskRef} />
    </div>
  );
}
