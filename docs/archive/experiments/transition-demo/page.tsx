"use client";

import { useState } from "react";
import TransitionPhase from "@/components/TransitionPhase";

// qi 的过渡数据
const qiTransition = {
  from: {
    pinyin: "q",
    label: "声母 q",
    description: "舌面前部抵住硬腭前部，气流爆破送出",
    icon: "👅",
    position: "舌面抵腭",
    action: "舌面离开",
  },
  to: {
    pinyin: "i",
    label: "韵母 i",
    description: "舌位前高，嘴角向两侧展开",
    icon: "👄",
    position: "舌位前高",
    action: "保持舌位",
  },
};

export default function TransitionDemo() {
  const [showTransition, setShowTransition] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handleStart = () => {
    setLog((prev) => [...prev, "开始播放声母 q..."]);
    setShowTransition(false);

    // 模拟声母播放 2 秒
    setTimeout(() => {
      setLog((prev) => [...prev, "声母 q 播放完成，开始过渡..."]);
      setShowTransition(true);
    }, 2000);
  };

  const handleTransitionComplete = () => {
    setLog((prev) => [...prev, "过渡完成，开始播放韵母 i..."]);
    setShowTransition(false);

    // 模拟韵母播放 2 秒
    setTimeout(() => {
      setLog((prev) => [...prev, "韵母 i 播放完成！"]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1A202C] mb-2">
          过渡动画试点：qi（q → i）
        </h1>
        <p className="text-[#718096] mb-8">
          测试声母到韵母的过渡效果
        </p>

        {/* 控制按钮 */}
        <div className="mb-6">
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-[#2C5282] text-white rounded-lg hover:bg-[#1A365D] transition-colors"
          >
            播放 qi 完整发音
          </button>
        </div>

        {/* 视频区域模拟 */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
          {/* 模拟视频内容 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {showTransition ? "🔄" : "🎬"}
              </div>
              <div className="text-white text-xl">
                {showTransition ? "过渡中..." : "视频播放区域"}
              </div>
            </div>
          </div>

          {/* 过渡动画层 */}
          {showTransition && (
            <TransitionPhase
              from={qiTransition.from}
              to={qiTransition.to}
              duration={400}
              onComplete={handleTransitionComplete}
            />
          )}
        </div>

        {/* 播放日志 */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4">
          <h3 className="text-sm font-medium text-[#1A202C] mb-3">播放日志</h3>
          <div className="space-y-2">
            {log.length === 0 && (
              <div className="text-sm text-[#718096]">点击按钮开始测试</div>
            )}
            {log.map((entry, index) => (
              <div
                key={index}
                className="text-sm text-[#1A202C] py-1 border-l-2 border-[#B7791F] pl-3"
              >
                <span className="text-[#718096] text-xs mr-2">
                  {new Date().toLocaleTimeString()}
                </span>
                {entry}
              </div>
            ))}
          </div>
        </div>

        {/* 说明 */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-[#E2E8F0]">
          <h3 className="text-sm font-medium text-[#1A202C] mb-2">过渡动画说明</h3>
          <ul className="text-sm text-[#718096] space-y-1 list-disc list-inside">
            <li>声母 q 播放 2 秒（舌面前部抵住硬腭前部）</li>
            <li>过渡动画 0.4 秒（舌面离开硬腭，移向前高位置）</li>
            <li>韵母 i 播放 2 秒（舌位前高，嘴角展开）</li>
            <li>总时长：4.4 秒</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
