import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "拼音实验室",
  description: "输入汉字，查看拼音拆解和舌位可视化动画。Enter Chinese characters to see pinyin breakdown and tongue position animations.",
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
