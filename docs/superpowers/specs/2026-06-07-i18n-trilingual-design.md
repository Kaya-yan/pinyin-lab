# PinyinLab 三语国际化设计文档

## 概述

为 PinyinLab 添加中文/English/Bahasa Indonesia 三语切换功能。目标用户为印尼华裔儿童（5-12岁），在课堂环境中由老师指导使用，同时支持学生自主探索。

## 设计目标

1. 默认中文界面，保持沉浸式教学定位
2. 支持一键切换到英语或印尼语
3. 拼音术语（声母/韵母）三语均保留中文+注音
4. 用户语言选择持久化（localStorage）
5. 不引入重型 i18n 依赖，保持静态导出兼容

## 架构设计

### 翻译系统

轻量级 React Context + JSON 翻译文件方案：

```
lib/i18n/
  zh.ts          # 中文翻译（65 个字符串）
  en.ts          # 英文翻译
  id.ts          # 印尼语翻译
  index.ts       # LanguageContext, useI18n hook, t() 函数
  types.ts       # 翻译 key 类型定义
```

**不使用 next-intl 或 react-i18next**，原因：
- 项目是静态导出（`output: 'export'`），服务端 i18n 路由不可用
- 仅 65 个字符串，不需要复数、插值等复杂功能
- 减少打包体积

### 核心 Hook

```typescript
// lib/i18n/index.ts
type Locale = 'zh' | 'en' | 'id';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// 使用方式
const { t, locale, setLocale } = useI18n();
// t('nav.lab') => '实验室' | 'Lab' | 'Laboratorium'
```

### 翻译 Key 结构

采用扁平 key 结构，按页面/组件分组：

```typescript
// lib/i18n/types.ts
export type TranslationKey =
  // Layout
  | 'meta.title'
  | 'meta.description'
  | 'skipToContent'

  // Navbar
  | 'nav.lab'
  | 'nav.clips'
  | 'nav.searchPlaceholder'
  | 'nav.searchAriaLabel'
  | 'nav.searchButton'

  // Lab page
  | 'lab.title'
  | 'lab.inputPlaceholder'
  | 'lab.inputAriaLabel'
  | 'lab.submit'
  | 'lab.emptyTitle'
  | 'lab.emptyDesc'
  | 'lab.relatedClips'
  | 'lab.loading'

  // Clips page
  | 'clips.title'
  | 'clips.subtitle'
  | 'clips.initials'
  | 'clips.initialsAria'
  | 'clips.finals'
  | 'clips.finalsAria'
  | 'clips.currentFilter'
  | 'clips.clearFilter'
  | 'clips.filteredTitle'
  | 'clips.allClips'
  | 'clips.clipCount'
  | 'clips.noResults'

  // VideoPlayer
  | 'player.tongueGif'
  | 'player.tongueVideo'
  | 'player.noVideo'
  | 'player.noVideoDesc'
  | 'player.toolbar'
  | 'player.prev'
  | 'player.play'
  | 'player.pause'
  | 'player.next'
  | 'player.loopOn'
  | 'player.loopOff'
  | 'player.slowOn'
  | 'player.slowOff'
  | 'player.progress'
  | 'player.nowPlaying'

  // ClipCard
  | 'clip.preview'

  // BilibiliModal
  | 'modal.close'
  | 'modal.player'
  | 'modal.teachingFocus'
  | 'modal.startTime'
  | 'modal.duration'
  | 'modal.viewOnBilibili'

  // PinyinStrip
  | 'strip.character'
  | 'strip.syllables'
  | 'strip.nowPlaying'
  | 'strip.clickToPlay'

  // Pinyin terms (三语保留中文+注音)
  | 'term.initial'
  | 'term.final'
  ;
```

### 翻译文件示例

```typescript
// lib/i18n/zh.ts
export const zh: Record<TranslationKey, string> = {
  'meta.title': 'PinyinLab - 汉语动态舌位可视化教学平台',
  'meta.description': '面向海外低龄汉语学习者的纯前端发音辅助工具',
  'skipToContent': '跳转到主要内容',
  'nav.lab': '实验室',
  'nav.clips': '片段库',
  'nav.searchPlaceholder': '输入汉字查询...',
  // ... 共 65 个
};

// lib/i18n/en.ts
export const en: Record<TranslationKey, string> = {
  'meta.title': 'PinyinLab - Chinese Tongue Position Visualization',
  'meta.description': 'A frontend pronunciation tool for young Chinese learners overseas',
  'skipToContent': 'Skip to main content',
  'nav.lab': 'Lab',
  'nav.clips': 'Clips',
  'nav.searchPlaceholder': 'Search characters...',
  // ...
};

// lib/i18n/id.ts
export const id: Record<TranslationKey, string> = {
  'meta.title': 'PinyinLab - Visualisasi Posisi Lidah Bahasa Mandarin',
  'meta.description': 'Alat bantu pengucapan untuk pembelajar muda Mandarin di luar negeri',
  'skipToContent': 'Lompat ke konten utama',
  'nav.lab': 'Laboratorium',
  'nav.clips': 'Klip',
  'nav.searchPlaceholder': 'Cari karakter...',
  // ...
};
```

## 语言切换器 UI

### 位置

导航栏最右侧，位于导航链接之后：

```
[PinyinLab]  [🔍 输入汉字...]  实验室  片段库  [🌐 中]
```

### 交互

点击地球图标展开下拉菜单（Popover/Dropdown）：

```
┌─────────────────────┐
│ 🌐  中文          ✓ │
│     English          │
│     Bahasa Indonesia │
└─────────────────────┘
```

- 当前语言显示勾选标记
- 点击选项后切换语言并关闭菜单
- 选择持久化到 `localStorage` key: `pinyinlab-locale`
- 下次访问自动加载上次选择的语言

### 组件实现

在 `components/Navbar.tsx` 中添加 `LanguageSwitcher` 组件：

```tsx
// components/LanguageSwitcher.tsx
"use client";
import { useI18n } from "@/lib/i18n";
import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: 'zh', label: '中文', short: '中' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'id', label: 'Bahasa Indonesia', short: 'ID' },
] as const;

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find(l => l.code === locale)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-11 px-3 text-sm font-medium text-secondary hover:text-primary transition-colors rounded-sm"
        aria-label="Change language"
        aria-expanded={open}
      >
        <GlobeIcon />
        <span>{current.short}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg py-1 min-w-[180px] z-50">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLocale(lang.code); setOpen(false); }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-highlight transition-colors flex items-center justify-between ${
                locale === lang.code ? 'text-primary font-medium' : 'text-text'
              }`}
            >
              <span>{lang.label}</span>
              {locale === lang.code && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 文字长度适配策略

### 问题

印尼语文字比中文长 2-5 倍：
- 声母 → Konsonan Awal (7x)
- 查询 → Pencarian (5x)

### 解决方案

1. **Navbar**：搜索框用 `flex-1` 自适应，语言切换器用 `min-w`
2. **筛选网格**：已有 `flex-wrap`，长文字自动换行。按钮用 `min-w-11` 而非固定 `w-11`
3. **VideoPlayer 控制栏**：图标按钮不依赖文字，仅 aria-label 翻译
4. **ClipCard**：预览按钮用 `w-full`，文字自然居中
5. **空状态提示**：`max-w` 限制宽度，允许换行

### Tailwind 调整

```tsx
// 声母/韵母筛选按钮：从固定宽度改为自适应
// 之前
className="w-11 h-11 sm:w-12 sm:h-12 ..."
// 之后
className="min-w-11 h-11 sm:min-w-12 sm:h-12 px-2 sm:px-3 ..."
```

## 需要修改的文件

| 文件 | 修改内容 |
|------|---------|
| `lib/i18n/zh.ts` | 新建：中文翻译文件 |
| `lib/i18n/en.ts` | 新建：英文翻译文件 |
| `lib/i18n/id.ts` | 新建：印尼语翻译文件 |
| `lib/i18n/types.ts` | 新建：TranslationKey 类型 |
| `lib/i18n/index.ts` | 新建：LanguageContext + useI18n hook |
| `app/layout.tsx` | 包裹 LanguageProvider，动态 title/description |
| `components/LanguageSwitcher.tsx` | 新建：语言切换组件 |
| `components/Navbar.tsx` | 添加 LanguageSwitcher，翻译所有中文字符串 |
| `app/lab/page.tsx` | 翻译 8 个中文字符串 |
| `app/clips/page.tsx` | 翻译 12 个中文字符串 |
| `components/VideoPlayer.tsx` | 翻译 16 个中文字符串 |
| `components/ClipCard.tsx` | 翻译 2 个中文字符串 |
| `components/BilibiliModal.tsx` | 翻译 6 个中文字符串 |
| `components/PinyinStrip.tsx` | 翻译 4 个中文字符串 |
| `tailwind.config.ts` | 可能需要调整筛选按钮宽度 |

## 拼音术语处理

声母/韵母是教学核心术语，三语均保留中文+拼音注音：

| 语言 | 声母显示 | 韵母显示 |
|------|---------|---------|
| 中文 | 声母 | 韵母 |
| English | 声母 (Initial) | 韵母 (Final) |
| Indonesia | 声母 (Initial) | 韵母 (Final) |

在 VideoPlayer 和 PinyinStrip 中，`current.sub.label` 的格式为：
- 中文：`声母 h`
- English：`声母 (Initial) h`
- Indonesia：`声母 (Initial) h`

## 不翻译的内容

以下内容三语保持一致，不纳入翻译系统：
- 拼音字母本身（b, p, m, f, ...）
- 汉字
- 片段库中的 `tags`、`focus` 字段（这些是教学内容描述，未来可独立翻译）
- Bilibili 相关内容（视频标题、UP主名称）

## 实施顺序

1. 创建 `lib/i18n/` 翻译系统（types, zh, en, id, index）
2. 在 `app/layout.tsx` 中添加 LanguageProvider
3. 创建 `LanguageSwitcher` 组件
4. 修改 `Navbar` 集成语言切换器 + 翻译
5. 逐页翻译：lab → clips → VideoPlayer → ClipCard → BilibiliModal → PinyinStrip
6. 调整 Tailwind 样式适配长文字
7. 测试三语切换 + localStorage 持久化
8. 构建验证

## 范围控制

**不在本次实施范围内**：
- URL 路由国际化（/lab → /en/lab）— 静态导出不支持
- 片段库 `focus` 字段翻译（教学内容，需人工校对）
- RTL 语言支持
- 语言自动检测（基于浏览器语言）
- 动态加载翻译文件（代码分割）
