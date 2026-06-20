import type { Metadata, Viewport } from "next";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF8",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pinyinlab.app"),
  title: {
    default: "PinyinLab - 汉语动态舌位可视化教学平台",
    template: "%s | PinyinLab",
  },
  description:
    "面向海外低龄汉语学习者的纯前端发音辅助工具，用可视化舌位视频替代平面口型示范。Interactive tongue position visualization for young Chinese learners worldwide.",
  keywords: [
    "pinyin",
    "Chinese learning",
    "tongue position",
    "pronunciation",
    "汉语拼音",
    "华裔教育",
    "中文学习",
    "belajar bahasa Mandarin",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US", "id_ID"],
    siteName: "PinyinLab",
    title: "PinyinLab - 汉语动态舌位可视化教学平台",
    description:
      "面向海外低龄汉语学习者的纯前端发音辅助工具，用可视化舌位视频替代平面口型示范。",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PinyinLab" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PinyinLab - 汉语动态舌位可视化教学平台",
    description: "面向海外低龄汉语学习者的纯前端发音辅助工具，用可视化舌位视频替代平面口型示范。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-text antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
