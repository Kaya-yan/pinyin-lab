# PinyinLab 完整开发 Prompt

> **发送给 Claude Code 的完整开发指令**
> 
> **项目路径**: `C:\Users\ht\Documents\pinyinlab\pinyin-lab`
> **技术栈**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + pinyin-pro
> **约束**: 纯静态导出、无后端、学术风设计（零阴影、零渐变）

---

## 一、项目背景与目标

PinyinLab 是面向海外低龄汉语学习者的纯前端发音辅助工具，参赛2026年山东大学第二届研究生国际中文教育案例大赛（数智赋能赛道）。

**核心功能**: 用户输入汉字（如"冰淇淋"），系统自动拆解为拼音（bīng qí lín），并顺序播放对应的舌位视频，同时推荐相关的 B站配音片段。

---

## 二、当前代码结构

```
pinyin-lab/
├── app/
│   ├── lab/page.tsx        # 发音实验室页（核心）
│   ├── clips/page.tsx      # 片段库页
│   ├── page.tsx            # 首页
│   ├── layout.tsx          # 根布局
│   └── globals.css         # 全局样式
├── components/
│   ├── Navbar.tsx
│   ├── PinyinStrip.tsx     # 拼音拆解条
│   ├── VideoPlayer.tsx     # 视频播放器（需重点修改）
│   ├── ClipCard.tsx        # 片段卡片（需重点修改）
│   └── BilibiliModal.tsx   # B站弹窗
├── lib/
│   ├── pinyin.ts           # 拼音解析逻辑
│   ├── types.ts            # TypeScript 类型
│   └── i18n/               # 国际化（中/英/印尼）
├── data/
│   ├── pinyinMap.json      # 拼音→视频映射
│   └── clips.json          # 片段数据（30条）
├── public/
│   ├── videos/             # 声母MOV + 韵母MP4
│   └── gif/initials/       # 声母GIF（m.gif, l.gif）
├── tailwind.config.ts      # Tailwind配置（需修正色值）
└── next.config.js
```

---

## 三、修改任务清单（按优先级排序）

### 任务1: 修正 Tailwind 色彩规范 [P0]

**文件**: `tailwind.config.ts`

**修改内容**:
```typescript
// 当前值 → 修改后
accent: "#8A5C17" → "#B7791F"        // 强调色修正为赭石色
"text-muted": "#5A6B80" → "#718096"  // 文字次色修正
```

**验证**: 修改后运行 `npm run build` 确保无报错。

---

### 任务2: 修复零声母 y/w 处理 [P0]

**文件**: `lib/pinyin.ts`

**问题**: `initialsList` 包含 `"y"` 和 `"w"`，但 `pinyinMap.json` 中没有对应数据。输入"雨(yǔ)"、"五(wǔ)"等字时会异常。

**修改要求**:

在 `extractInitial` 函数后添加零声母判断:

```typescript
function extractInitial(py: string): string {
  for (const init of initialsList) {
    if (py.startsWith(init)) return init;
  }
  return "";
}

// 新增：判断是否为有效声母（排除零声母 y/w）
function isValidInitial(initial: string): boolean {
  return initial !== "" && initial !== "y" && initial !== "w";
}
```

在 `parseWord` 函数中修改 sub-segments 生成逻辑:

```typescript
// 原代码:
if (initialData) {
  subs.push({ label: `声母 ${initial}`, video: initialData.video, gif: initialData.gif || null });
}

// 修改为:
if (isValidInitial(initial) && initialData) {
  subs.push({ label: `声母 ${initial}`, video: initialData.video, gif: initialData.gif || null });
}
```

**验证**: 输入"雨"、"五"、"云"等零声母字，应正确解析韵母，不报错。

---

### 任务3: 重构视频播放器 VideoPlayer.tsx [P0]

**当前问题**:
1. 视频切换淡入淡出时间为100ms，过于急促
2. 预加载策略对所有资源使用 `preload="auto"`，大体积GIF/MOV不友好
3. 缺少加载状态提示

**修改要求**:

#### 3.1 延长淡入淡出时间至200ms

```typescript
// 修改前 (第129行附近)
const timer = setTimeout(() => { ... }, 100);

// 修改后
const timer = setTimeout(() => { ... }, 200);
```

同时修改 CSS 过渡时间:
```tsx
<div className={`relative transition-opacity duration-200 ${fadeClass}`}>
```

#### 3.2 优化视频预加载策略

根据资源类型设置不同 preload:
```tsx
preload={current.sub.video?.endsWith('.mp4') ? "auto" : "metadata"}
```

#### 3.3 添加加载状态提示

添加 `isLoading` state:
```typescript
const [isLoading, setIsLoading] = useState(false);

// 在切换视频时设置加载状态
useEffect(() => {
  setIsLoading(true);
  // ... 现有逻辑
  if (!isGif) {
    video.load();
    video.play().then(() => {
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  } else {
    setIsLoading(false);
  }
}, [flatIdx, current, isSlow, isLoop, flatSubs.length]);
```

在视频容器内添加加载提示:
```tsx
<div className="relative">
  {/* 加载提示 */}
  {isLoading && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
      <div className="text-white text-sm">加载中...</div>
    </div>
  )}
  {/* 视频/GIF */}
  ...
</div>
```

---

### 任务4: 实现 SVG 生成式封面 [P0]

**文件**: `components/ClipCard.tsx` + 新建 `components/CoverPlaceholder.tsx`

**当前问题**: 所有片段卡片使用文字占位，无实际封面图。

**设计原则**:
- 纯 SVG/代码生成，零外部依赖
- 风格统一，符合学术风
- 根据片段标题首字和拼音标签生成独特视觉

**实现方案**:

创建新组件 `components/CoverPlaceholder.tsx`:

```tsx
"use client";

interface CoverPlaceholderProps {
  title: string;
  tags: string[];
}

// 预设学术风配色（从主色/辅助色衍生）
const COLORS = [
  "#2C5282", // 主色-学术蓝
  "#4A5568", // 辅助色
  "#744210", // 深赭石
  "#276749", // 深绿
  "#702459", // 深紫
  "#1A365D", // 深蓝
  "#553C9A", // 深紫蓝
  "#9C4221", // 深橙
];

function getColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function CoverPlaceholder({ title, tags }: CoverPlaceholderProps) {
  const bgColor = getColor(title);
  const firstChar = title.charAt(0);
  const secondChar = title.charAt(1) || "";
  const displayText = secondChar ? `${firstChar}${secondChar}` : firstChar;

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
      <div className="text-center">
        <span className="text-white text-4xl font-bold">{displayText}</span>
        <div className="flex gap-1 justify-center mt-2">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-white/70 text-xs px-1.5 py-0.5 rounded-sm border border-white/30">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

修改 `ClipCard.tsx`:

```tsx
import CoverPlaceholder from "./CoverPlaceholder";

// 替换封面渲染逻辑:
<div className="relative aspect-video overflow-hidden">
  <CoverPlaceholder title={clip.title} tags={clip.tags} />
  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-sm tabular-nums">
    {clip.duration}
  </div>
</div>
```

---

### 任务5: 优化首页 Hero 区域 [P1]

**文件**: `app/page.tsx`

**当前问题**:
1. 功能介绍文字过多
2. CTA按钮样式可以更加突出
3. FeatureCard使用了渐变背景（违反零渐变原则）

**修改要求**:

#### 5.1 移除渐变背景

修改 FeatureCard 的 accentColor 使用纯色:
```tsx
// 修改前:
accentColor="bg-gradient-to-b from-highlight to-primary/5"

// 修改后:
accentColor="bg-highlight"
```

#### 5.2 优化 CTA 按钮

增大按钮视觉权重:
```tsx
<Link
  href="/lab"
  className="inline-flex items-center justify-center h-14 px-10 bg-primary text-white text-base font-medium rounded-md hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-150"
>
  {t("landing.cta")}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
</Link>
```

---

### 任务6: 优化 Lab 页面输入区域 [P1]

**文件**: `app/lab/page.tsx`

**修改要求**:

#### 6.1 增强输入区域视觉权重

```tsx
{/* 搜索区 - 增加视觉层次 */}
<section className="mb-6 sm:mb-8 bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm hero-enter">
  <h1 className="sr-only">{t("lab.title")}</h1>
  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={t("lab.inputPlaceholder")}
      maxLength={20}
      className="w-full max-w-md h-14 px-6 border-2 border-border rounded-lg text-lg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150"
      aria-label={t("lab.inputAriaLabel")}
    />
    <button
      type="submit"
      className="w-full sm:w-auto h-14 px-8 bg-primary text-white text-base font-medium rounded-lg hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150 whitespace-nowrap"
    >
      {t("lab.submit")}
    </button>
  </form>
</section>
```

---

### 任务7: 优化 Clips 页面卡片交互 [P1]

**文件**: `app/clips/page.tsx` + `components/ClipCard.tsx`

**修改要求**:

#### 7.1 添加卡片悬停效果

修改 `ClipCard.tsx`:
```tsx
<article className="bg-surface border border-border rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden group">
```

#### 7.2 添加分类标签筛选（可选增强）

在 `clips/page.tsx` 添加分类标签:
```tsx
// 在拼音按钮网格上方添加
<div className="flex gap-2 mb-4 overflow-x-auto pb-2">
  <button className="px-3 py-1 text-sm rounded-full bg-primary text-white">全部</button>
  <button className="px-3 py-1 text-sm rounded-full bg-surface border border-border text-text-muted hover:border-primary">动画</button>
  <button className="px-3 py-1 text-sm rounded-full bg-surface border border-border text-text-muted hover:border-primary">电影</button>
</div>
```

---

## 四、关键注意事项

### 4.1 设计原则（必须遵守）

| 规范 | 要求 | 检查方式 |
|------|------|---------|
| 零阴影 | 禁止 `box-shadow` | 搜索代码中 `shadow` 关键字 |
| 零渐变 | 禁止 `linear-gradient` | 搜索代码中 `gradient` 关键字 |
| 学术风 | 使用学术蓝 `#2C5282` 为主色 | 检查 tailwind.config.ts |
| 圆角 | 统一使用 4px/8px/12px | 检查 rounded-* 类名 |

### 4.2 无障碍支持（必须保留）

- 所有交互元素必须有 `aria-label`
- 焦点状态必须可见 (`focus-visible:ring`)
- 键盘导航必须完整 (Tab, Enter, Escape, Arrow keys)
- 颜色对比度必须符合 WCAG 2.1 AA 标准

### 4.3 TypeScript 严格模式

- 所有新增代码必须通过类型检查
- 禁止使用 `any` 类型
- 接口定义必须完整

---

## 五、验证清单

完成所有修改后，请验证以下项目:

### 5.1 构建验证
- [ ] `npm run build` 成功，无 TypeScript 错误
- [ ] `npm run build` 成功，无 ESLint 错误
- [ ] 静态导出文件生成在 `out/` 目录

### 5.2 功能验证
- [ ] 访问 `/lab`，输入"冰淇淋"，正常显示拼音拆解条
- [ ] 输入"马"（mǎ），显示 m.gif，效果与视频一致
- [ ] 输入"雨"（yǔ），正确解析韵母，不报错
- [ ] 视频切换时有 0.2 秒淡入淡出效果
- [ ] 视频加载时显示"加载中..."提示
- [ ] 访问 `/clips`，片段卡片显示彩色 SVG 封面
- [ ] 片段卡片悬停时有上浮效果
- [ ] 点击片段卡片，B站弹窗正常显示

### 5.3 设计验证
- [ ] 页面无阴影效果（除浏览器默认外）
- [ ] 页面无渐变背景
- [ ] 色彩与 tailwind.config.ts 定义一致
- [ ] 移动端适配正常

---

## 六、文件修改汇总

| 文件路径 | 修改类型 | 优先级 |
|---------|---------|--------|
| `tailwind.config.ts` | 修正色值 | P0 |
| `lib/pinyin.ts` | 修复零声母处理 | P0 |
| `components/VideoPlayer.tsx` | 优化过渡、预加载、加载状态 | P0 |
| `components/CoverPlaceholder.tsx` | 新建组件 | P0 |
| `components/ClipCard.tsx` | 集成封面组件、悬停效果 | P0 |
| `app/page.tsx` | 移除渐变、优化CTA | P1 |
| `app/lab/page.tsx` | 优化输入区域样式 | P1 |
| `app/clips/page.tsx` | 添加分类标签（可选） | P2 |

---

## 七、参考文档

项目根目录下有以下参考文档:
- `PinyinLab项目审查报告.md` - 详细审查报告
- `UI设计竞品分析报告.md` - 6个竞品平台的UI分析
- `开发方案v3.0.md` - 产品设计方案

---

**请按照以上任务清单逐项完成，每完成一项在验证清单中打勾。遇到任何问题请立即反馈。**
