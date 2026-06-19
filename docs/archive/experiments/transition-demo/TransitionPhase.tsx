"use client";

import { useEffect, useState } from "react";

interface TransitionPhaseProps {
  from: {
    pinyin: string;
    label: string;
    description: string;
    icon: string;
    position: string;
    action: string;
  };
  to: {
    pinyin: string;
    label: string;
    description: string;
    icon: string;
    position: string;
    action: string;
  };
  duration?: number;
  onComplete?: () => void;
}

export default function TransitionPhase({
  from,
  to,
  duration = 400,
  onComplete,
}: TransitionPhaseProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"preparing" | "transitioning" | "complete">("preparing");

  useEffect(() => {
    // 准备阶段：200ms
    const prepareTimer = setTimeout(() => {
      setPhase("transitioning");
    }, 200);

    return () => clearTimeout(prepareTimer);
  }, []);

  useEffect(() => {
    if (phase !== "transitioning") return;

    const interval = 20; // 每20ms更新一次
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setPhase("complete");
          setTimeout(() => {
            onComplete?.();
          }, 200);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [phase, duration, onComplete]);

  // 计算舌头位置（基于进度）
  const tongueProgress = Math.min(progress / 100, 1);
  
  // q → i 的舌头移动：从硬腭前部（x: 120）到前高（x: 100）
  const tongueX = 120 - (20 * tongueProgress);
  const tongueY = 80 - (10 * tongueProgress);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1A202C]/95 z-20">
      <div className="text-center max-w-sm w-full px-6">
        {/* 标题 */}
        <div className="text-white/60 text-sm mb-6">
          发音过渡
        </div>

        {/* 发音器官可视化 */}
        <div className="relative h-40 mb-6">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            {/* 口腔轮廓 */}
            <path
              d="M20,60 Q100,10 180,60 Q100,110 20,60"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            
            {/* 上颚 */}
            <path
              d="M20,60 Q100,10 180,60"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* 舌头起始位置（半透明） */}
            <ellipse
              cx="120"
              cy="80"
              rx="15"
              ry="8"
              fill="rgba(183,121,31,0.3)"
            />

            {/* 舌头当前位置 */}
            <ellipse
              cx={tongueX}
              cy={tongueY}
              rx="15"
              ry="8"
              fill="#B7791F"
              className="transition-all"
            >
              <animate
                attributeName="cx"
                from="120"
                to="100"
                dur={`${duration}ms`}
                fill="freeze"
              />
              <animate
                attributeName="cy"
                from="80"
                to="70"
                dur={`${duration}ms`}
                fill="freeze"
              />
            </ellipse>

            {/* 气流箭头（q的送气特征） */}
            {progress < 50 && (
              <g opacity={1 - (progress / 50)}>
                <path
                  d="M140,60 L160,60"
                  stroke="#B7791F"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#B7791F" />
                  </marker>
                </defs>
              </g>
            )}

            {/* 位置标注线 */}
            <line
              x1={tongueX}
              y1={tongueY - 15}
              x2={tongueX}
              y2={tongueY - 25}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1"
            />
            <text
              x={tongueX}
              y={tongueY - 30}
              textAnchor="middle"
              fill="white"
              fontSize="8"
            >
              舌位
            </text>
          </svg>
        </div>

        {/* 发音信息 */}
        <div className="flex items-center justify-between mb-4">
          {/* 起始 */}
          <div className="text-center flex-1">
            <div className="text-2xl mb-1">{from.icon}</div>
            <div className="text-white text-sm font-medium">{from.pinyin}</div>
            <div className="text-white/50 text-xs">{from.position}</div>
          </div>

          {/* 箭头 */}
          <div className="px-4">
            <div 
              className="text-2xl text-accent transition-transform"
              style={{ 
                transform: `translateX(${(progress - 50) * 0.3}px)`,
                opacity: 0.5 + (progress / 200)
              }}
            >
              →
            </div>
          </div>

          {/* 目标 */}
          <div className="text-center flex-1">
            <div className="text-2xl mb-1">{to.icon}</div>
            <div className="text-white text-sm font-medium">{to.pinyin}</div>
            <div className="text-white/50 text-xs">{to.position}</div>
          </div>
        </div>

        {/* 动作描述 */}
        <div className="text-sm text-white/80 mb-4">
          <span className="text-accent">{from.action}</span>
          <span className="mx-2 text-white/40">→</span>
          <span className="text-accent">{to.action}</span>
        </div>

        {/* 进度条 */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 进度文字 */}
        <div className="text-xs text-white/40 mt-2">
          {phase === "preparing" && "准备过渡..."}
          {phase === "transitioning" && `过渡中 ${Math.round(progress)}%`}
          {phase === "complete" && "过渡完成"}
        </div>

        {/* 语言学描述 */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-white/60 leading-relaxed">
            {from.description}，{to.description}
          </div>
        </div>
      </div>
    </div>
  );
}
