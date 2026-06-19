import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "教学片段库",
  description: "精选动画配音片段，按声母韵母筛选，沉浸式学习中文发音。Curated animation clips for immersive Chinese pronunciation learning.",
};

export default function ClipsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
