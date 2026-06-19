# PinyinLab 修改 Prompt

> **目标**：基于审查反馈优化 PinyinLab 项目，修复核心问题并提升用户体验。
> **技术栈**：Next.js 14 (App Router) + TypeScript + Tailwind CSS + pinyin-pro
> **约束**：纯静态导出、无后端、无阴影、无渐变、学术风设计

---

## 一、项目背景

PinyinLab 是一个面向海外低龄汉语学习者的纯前端发音辅助工具。用户输入汉字（如"冰淇淋"），系统自动拆解为拼音（bīng qí lín），并顺序播放对应的舌位视频，同时推荐相关的 B站配音片段。

**当前代码结构**：

```
pinyin-lab/
├── app/
│   ├── lab/page.tsx        # 发音实验室页（核心）
│   ├── clips/page.tsx      # 片段库页
│   ├── layout.tsx          # 根布局
│   └── globals.css         # 全局样式
├── components/
│   ├── Navbar.tsx
│   ├── PinyinStrip.tsx     # 拼音拆解条
│   ├── VideoPlayer.tsx     # 视频播放器（重点修改）
│   ├── ClipCard.tsx        # 片段卡片（重点修改）
│   └── BilibiliModal.tsx   # B站弹窗
├── lib/
│   ├── pinyin.ts           # 拼音解析（需修复零声母）
│   └── types.ts
├── data/
│   ├── pinyinMap.json      # 拼音映射
│   └── clips.json          # 片段数据
├── tailwind.config.ts      # 需修正色值
└── next.config.js
```

---

## 二、修改任务清单

### 任务 1：修正 Tailwind 色彩规范

**文件**：`tailwind.config.ts`

**修改内容**：
- `accent: "#8A5C17"` → `"#B7791F"`（强调色修正为方案定义的赭石色）
- `"text-muted": "#5A6B80"` → `"#718096"`（文字次色修正）

**验证**：修改后重新运行 `npm run build`，确保无报错。

---

### 任务 2：修复零声母 y/w 处理

**文件**：`lib/pinyin.ts`

**问题**：当前 `initialsList` 包含 `"y"` 和 `"w"`，但 `pinyinMap.json` 中没有对应的声母数据。当用户输入"雨(yǔ)"、"五(wǔ)"等字时，`extractInitial` 会提取出 y/w，但查不到对应的声母数据，导致 sub-segments 缺失。

**修改要求**：

在 `extractInitial` 函数后，添加零声母判断逻辑：

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

在 `parseWord` 函数中，修改 sub-segments 生成逻辑：

```typescript
// 原代码：
if (initialData) {
  subs.push({ label: `声母 ${initial}`, video: initialData.video, gif: initialData.gif || null });
}

// 修改为：
if (isValidInitial(initial) && initialData) {
  subs.push({ label: `声母 ${initial}`, video: initialData.video, gif: initialData.gif || null });
}
```

**验证**：输入"雨"、"五"、"云"等零声母字，应正确解析韵母，不报错。

---

### 任务 3：重构视频播放器（核心修改）

**文件**：`components/VideoPlayer.tsx`

**修改原则**：
1. **取消左侧 GIF 展示区**，改为统一的单视频区域
2. **有声母 MOV 视频时**：正常播放 MOV 视频
3. **无声母 MOV 视频时（m、l）**：在视频区域播放 GIF，用户感知与视频一致
4. **韵母**：始终播放 MP4 视频
5. **视频切换时**：实现 0.2 秒淡入淡出过渡

**具体修改**：

#### 3.1 修改视频渲染逻辑

当前代码使用 `<video>` 标签播放所有内容。需要修改为：

- 当 `current.sub.video` 存在时：使用 `<video>` 标签
- 当 `current.sub.video` 为 null 但 `current.sub.gif` 存在时：使用 `<img>` 标签播放 GIF
- 两者都为 null 时：显示"暂无视频资源"

```tsx
{/* 视频/GIF 渲染 */}
{currentSrc ? (
  current.sub.video ? (
    <video
      ref={videoRef}
      className="w-full aspect-video object-contain"
      playsInline
      preload="auto"
      aria-label={`${current.pinyin} ${current.sub.label} 舌位视频`}
    />
  ) : (
    <img
      src={current.sub.gif}
      alt={`${current.pinyin} ${current.sub.label} 舌位动画`}
      className="w-full aspect-video object-contain"
      style={{ backgroundColor: '#000' }}
    />
  )
) : (
  <div className="w-full aspect-video flex items-center justify-center bg-gray-100 text-text-muted">
    <div className="text-center px-4">
      <p className="text-lg mb-2">暂无视频资源</p>
      <p className="text-sm">拼音「{current.pinyin}」的舌位视频尚未收录</p>
    </div>
  </div>
)}
```

#### 3.2 优化淡入淡出过渡

当前 fadeClass 过渡时间为 100ms，需调整为 200ms：

```tsx
{/* 修改前 */}
const timer = setTimeout(() => { ... }, 100);

{/* 修改后 */}
const timer = setTimeout(() => { ... }, 200);
```

同时修改 CSS 过渡时间：

```tsx
<div className={`relative transition-opacity duration-200 ${fadeClass}`}>
```

#### 3.3 优化视频预加载策略

根据资源类型设置不同的 preload 策略：

```tsx
{/* 韵母 MP4 体积小，使用 auto */}
{/* 声母 MOV/GIF 体积大，使用 metadata */}
preload={current.sub.video?.endsWith('.mp4') ? "auto" : "metadata"}
```

#### 3.4 处理 GIF 的自动播放

GIF 使用 `<img>` 标签时，浏览器会自动循环播放。但需要在切换时保持淡入淡出效果。

由于 GIF 没有 `ended` 事件，需要手动控制播放时长：

```typescript
// 当当前内容是 GIF 时，设置定时器自动切换
useEffect(() => {
  if (!current || current.sub.video) return; // 视频由 ended 事件处理
  if (!current.sub.gif) return;

  // GIF 播放 2 秒后自动切换（与视频时长一致）
  const timer = setTimeout(() => {
    if (!isLoop && flatIdx < flatSubs.length - 1) {
      setFlatIdx(flatIdx + 1);
    }
  }, 2000);

  return () => clearTimeout(timer);
}, [flatIdx, current, isLoop, flatSubs.length]);
```

**验证**：
1. 输入"冰"（bīng）：应播放 b.mov 视频，正常显示
2. 输入"马"（mǎ）：应播放 m.gif，显示效果与视频一致
3. 输入"了"（le）：应播放 l.gif，显示效果与视频一致
4. 视频切换时应有 0.2 秒淡入淡出效果

---

### 任务 4：实现 SVG 生成式封面

**文件**：`components/ClipCard.tsx`

**设计原则**：
- 纯 SVG 生成，零外部依赖
- 风格统一，符合学术风
- 根据片段标题首字和拼音标签生成独特视觉

**实现方案**：

创建一个新的 `CoverPlaceholder` 组件：

```tsx
// components/CoverPlaceholder.tsx
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

修改 `ClipCard.tsx`，使用 `CoverPlaceholder` 替代文字占位：

```tsx
{/* 封面 */}
<div className="relative aspect-video overflow-hidden">
  <CoverPlaceholder title={clip.title} tags={clip.tags} />
  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-sm tabular-nums">
    {clip.duration}
  </div>
</div>
```

**验证**：片段卡片应显示彩色背景 + 标题前两个字 + 拼音标签。

---

### 任务 5：添加加载状态提示

**文件**：`components/VideoPlayer.tsx`

**修改要求**：

在视频容器内添加加载状态：

```tsx
{/* 在视频容器内添加 */}
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

添加 `isLoading` 状态：

```typescript
const [isLoading, setIsLoading] = useState(false);

// 在切换视频时设置加载状态
useEffect(() => {
  setIsLoading(true);
  // ... 现有逻辑
  video.load();
  video.play().then(() => {
    setIsLoading(false);
  }).catch(() => {
    setIsLoading(false);
  });
}, [flatIdx, current, isSlow, isLoop, flatSubs.length]);
```

**验证**：视频切换时显示"加载中..."提示。

---

### 任务 6：运行构建并验证

**命令**：

```bash
npm run build
```

**验证清单**：

- [ ] 构建成功，无 TypeScript 错误
- [ ] 构建成功，无 ESLint 错误
- [ ] 访问 `/lab`，输入"冰淇淋"，正常显示拼音拆解条
- [ ] 视频播放器正常播放声母/韵母视频
- [ ] 输入"马"（mǎ），显示 m.gif，效果与视频一致
- [ ] 视频切换时有淡入淡出效果
- [ ] 访问 `/clips`，片段卡片显示 SVG 封面
- [ ] 点击片段卡片，B站弹窗正常显示

---

## 三、关键注意事项

1. **不要修改设计原则**：保持零阴影、零渐变、学术风
2. **保持无障碍支持**：所有修改需保留 ARIA 标签和键盘导航
3. **GIF 播放时长**：统一为 2 秒（与视频 duration 一致）
4. **颜色哈希算法**：确保相同标题始终生成相同颜色
5. **TypeScript 严格模式**：所有新增代码需通过类型检查

---

## 四、修改后预期效果

| 功能 | 修改前 | 修改后 |
|------|--------|--------|
| 视频播放器 | 仅支持视频，m/l 显示"暂无资源" | 支持视频+GIF，m/l 正常播放 GIF |
| 视频切换 | 直接切换，可能闪烁 | 0.2 秒淡入淡出，丝滑过渡 |
| 片段封面 | 灰色背景+文字 | 彩色 SVG 封面+标题+标签 |
| 零声母字 | 可能报错或缺失 | 正确解析韵母，正常播放 |
| 加载状态 | 无 | 显示"加载中..."提示 |
