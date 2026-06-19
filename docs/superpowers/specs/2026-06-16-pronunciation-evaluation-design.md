# PinyinLab 发音评测功能设计规格

## 一、概述

**功能名称**: PinyinLab 发音评测（Pronunciation Evaluation）
**设计日期**: 2026-06-16
**状态**: 已批准，待实现

### 1.1 背景与目标

在现有的 `/lab` 页面中，为每个已查询的字词提供"开口评测"入口。用户录音后，系统对比识别结果与目标拼音，生成综合评分并在拼音拆解条上高亮错误点，学生可一键查看正确舌位描述。

核心价值：
- 让学生"听到自己的发音问题"
- 结合 PinyinLab 现有舌位视频资源，提供"发现问题 → 学习正确舌位 → 再次练习"的完整学习闭环
- 零 API 成本，完全依赖浏览器原生能力

### 1.2 用户故事

> **作为** 印尼华裔小学生
> **我想要** 在查询"妈妈"后，点击麦克风录制自己的发音，获得评分和错误反馈
> **以便** 知道自己的 m 声母是否标准，并观看正确舌位视频学习改进

### 1.3 关键约束

- 纯前端实现，无后端依赖
- 不使用任何付费语音 API
- 遵循 PinyinLab 学术克制风设计系统
- 兼容主流浏览器（Chrome/Edge 为最佳）

---

## 二、技术架构

### 2.1 技术选型

| 模块 | 技术方案 | 理由 |
|------|---------|------|
| 语音识别 | Web Speech API (SpeechRecognition) | 浏览器内置，支持中文，无需 API Key |
| 音频录制 | MediaRecorder API | 配合 SpeechRecognition 使用 |
| 评分计算 | 本地算法 (lib/evaluate.ts) | 基于 pinyinMap.json 数据，无依赖 |
| 反馈生成 | 本地算法 | 根据评测结果匹配 pinyinMap.json 中的 description |

**技术可行性**：

Web Speech API 的 `SpeechRecognition` 接口：
- Chrome 33+ 完整支持中文语音识别
- Edge 79+ 完整支持
- Safari 14.1+ 部分支持（需测试）
- Firefox 不支持（需显示兼容性提示）

### 2.2 数据流

```
用户点击麦克风按钮
  │
  ▼
MediaRecorder API 申请麦克风权限并开始录制
  │
  ▼
用户说话（最多 10 秒或手动停止）
  │
  ▼
Web Speech API (SpeechRecognition) 实时识别语音
  │
  ▼
API 返回识别结果（中文汉字字符串）
  │
  ▼
lib/evaluate.ts 对照目标字词进行评测
  │
  ├─ 完全匹配 → 计算详细评分（声母/韵母/声调）
  ├─ 部分匹配 → 标记差异音节
  └─ 无法识别 → 显示友好提示
  │
  ▼
生成评测报告（分数 + 错误点 + 舌位反馈）
  │
  ▼
UI 更新：评分显示 + PinyinStrip 错误高亮
```

### 2.3 评分算法

```
总分 = 声母匹配度 × 40% + 韵母匹配度 × 40% + 声调匹配度 × 20%
```

**评分维度**：

1. **声母匹配度** (40%)
   - 完全正确：100分
   - 混淆音（zh/z, ch/c, sh/s, r/l 等）：60分
   - 其他错误：0分

2. **韵母匹配度** (40%)
   - 完全正确：100分
   - 近似韵母（如 an/ang）：70分
   - 其他错误：0分

3. **声调匹配度** (20%)
   - 完全正确：100分
   - Web Speech API 置信度 < 0.8：标记"声调未检测"
   - 其他错误：0分

**识别结果映射**：
- Web Speech API 返回汉字文本
- 使用 pinyin-pro 将识别结果转换为拼音
- 与目标拼音逐音节对比

### 2.4 混淆音对照表

```typescript
const CONFUSION_PAIRS = {
  // 翘舌 vs 平舌
  zh: ['z'],
  ch: ['c'],
  sh: ['s'],
  r: ['l'],
  // 鼻音
  n: ['l'],
  m: ['n'],
  // 送气 vs 不送气
  b: ['p'],
  d: ['t'],
  g: ['k'],
  // 韵母混淆
  an: ['ang'],
  en: ['eng'],
  in: ['ing'],
};
```

---

## 三、UI/UX 设计

### 3.1 页面布局

**/lab 页面更新后的结构**：

```
┌─────────────────────────────────────────────────────────┐
│                     导航栏 (Navbar)                      │
├─────────────────────────────────────────────────────────┤
│                     搜索区 (不变)                         │
├─────────────────────────────────────────────────────────┤
│                   拼音拆解条 (更新)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [NEW] 评测结果叠加层：分数 + 错误高亮            │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                   视频播放器 (不变)                       │
├─────────────────────────────────────────────────────────┤
│              [NEW] 发音评测区 (核心新增)                  │
├─────────────────────────────────────────────────────────┤
│                 关联片段推荐 (不变)                       │
└─────────────────────────────────────────────────────────┘
```

### 3.2 发音评测区组件

```
┌─────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────┐  │
│  │  目标字词：妈妈                                     │  │
│  │  请用普通话清晰朗读上方字词                          │  │
│  │                                                    │  │
│  │           ┌─────────────────────┐                 │  │
│  │           │     🎤 开始录音      │                 │  │
│  │           │    (48px 高按钮)    │                 │  │
│  │           └─────────────────────┘                 │  │
│  │                                                    │  │
│  │  录音状态提示区域                                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**按钮状态**：
- 默认态：学术蓝背景，白色麦克风图标，显示"开始录音"
- 录音中：红色背景，脉冲动画，显示"录音中..." + 时长
- 处理中：灰色背景，显示"分析中..."
- 错误态：显示错误提示 + 重试按钮

### 3.3 评测结果叠加层

**结果卡片**：

```
┌─────────────────────────────────────────────────────────┐
│  评测结果                               [重新评测]       │
│  ═══════════════                                        │
│                                                         │
│  综合得分：78 / 100                                     │
│  ████████████████░░░░░░░░░                              │
│                                                         │
│  逐音节分析：                                           │
│  ┌─────────┐  ┌─────────┐                             │
│  │ ✓ 妈    │  │ ✗ 妈    │                             │
│  │  声母 90│  │  声母 65│                             │
│  │  韵母 95│  │  韵母 70│                             │
│  └─────────┘  └─────────┘                             │
│                                                         │
│  发音建议：                                             │
│  ⚠ 第二个"妈"字的 m 声母舌尖位置偏高，                  │
│    建议舌尖轻抵上齿龈，气流从鼻腔通过                    │
│                                                         │
│  [观看舌位视频]                                         │
└─────────────────────────────────────────────────────────┘
```

**PinyinStrip 错误高亮**：

```
拼音拆解条更新：
┌─────────┐ ┌─────────┐
│  妈(ma) │ │  妈(ma) │   ← 右侧卡片高亮
│  ✓ 正确  │ │  ✗ 需改进│
└─────────┘ └─────────┘
```

### 3.4 错误提示 UI

| 场景 | 提示文案 | 样式 |
|------|---------|------|
| 麦克风权限被拒绝 | "请允许浏览器使用麦克风，以便进行发音评测" | 警告黄色背景 |
| 浏览器不支持 | "当前浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器" | 警告黄色背景 |
| 未识别到内容 | "未检测到发音，请重新尝试" | 提示蓝色背景 |
| 识别结果不匹配 | "听到的内容与目标不符，请用普通话清晰朗读" | 提示蓝色背景 |
| 网络问题 | "语音服务暂时不可用，请检查网络连接" | 警告黄色背景 |

### 3.5 设计规范遵循

| 规范项 | 实现 | 状态 |
|--------|------|------|
| 48px 最小触控目标 | 麦克风按钮高度 48px | ✅ |
| 学术蓝 #2C5282 | 主按钮背景色 | ✅ |
| 扁平化零阴影 | 结果卡片无阴影 | ✅ |
| 1px 边框 #E2E8F0 | 卡片边框 | ✅ |
| 8px 圆角 | 卡片圆角 | ✅ |
| 错误状态使用黄色/红色 | 错误/需改进标记 | ✅ |

---

## 四、文件结构

### 4.1 新增文件清单

| 文件路径 | 职责 | 优先级 |
|---------|------|--------|
| `hooks/useSpeechRecognition.ts` | 封装 MediaRecorder + Web Speech API | P0 |
| `lib/evaluate.ts` | 评测逻辑：文本对比 + 分数计算 + 反馈生成 | P0 |
| `lib/evaluate.types.ts` | 评测相关 TypeScript 类型定义 | P0 |
| `components/PronunciationEvaluator.tsx` | 评测 UI：麦克风按钮 + 录音状态 | P0 |
| `components/EvaluationResult.tsx` | 评测结果组件：分数 + 高亮拼音 + 反馈 | P0 |
| `components/PinyinStrip.tsx` | 更新：支持评测结果叠加高亮 | P0 |
| `app/lab/page.tsx` | 集成评测组件到 /lab 页面 | P0 |
| `lib/i18n/zh.ts` | 新增评测相关中文翻译 | P1 |
| `lib/i18n/en.ts` | 新增评测相关英文翻译 | P1 |
| `lib/i18n/id.ts` | 新增评测相关印尼文翻译 | P1 |

### 4.2 文件依赖关系

```
app/lab/page.tsx
    │
    ├── components/PronunciationEvaluator.tsx
    │       │
    │       └── hooks/useSpeechRecognition.ts
    │
    ├── components/EvaluationResult.tsx
    │       │
    │       └── lib/evaluate.ts
    │               │
    │               ├── lib/evaluate.types.ts
    │               └── data/pinyinMap.json (readonly)
    │
    └── components/PinyinStrip.tsx (更新)
            │
            └── lib/i18n/*.ts (新增翻译)
```

---

## 五、组件规格

### 5.1 useSpeechRecognition Hook

**接口设计**：

```typescript
interface SpeechRecognitionResult {
  transcript: string;        // 识别出的中文文本
  confidence: number;        // 置信度 0-1
  isFinal: boolean;          // 是否为最终结果
}

interface UseSpeechRecognitionReturn {
  // 状态
  isSupported: boolean;      // 浏览器是否支持
  isRecording: boolean;      // 是否正在录音
  isProcessing: boolean;     // 是否正在处理
  error: string | null;      // 错误信息

  // 结果
  result: SpeechRecognitionResult | null;

  // 方法
  startRecording: () => Promise<void>;   // 开始录音
  stopRecording: () => void;            // 停止录音
  reset: () => void;                    // 重置状态
}
```

**使用示例**：

```typescript
const {
  isSupported,
  isRecording,
  isProcessing,
  error,
  result,
  startRecording,
  stopRecording,
  reset,
} = useSpeechRecognition();
```

### 5.2 PronunciationEvaluator 组件

**Props**：

```typescript
interface PronunciationEvaluatorProps {
  targetWord: string;           // 目标字词，如"妈妈"
  segments: PinyinSegment[];    // 拼音拆解结果
  onEvaluationComplete?: (result: EvaluationResult) => void;
}
```

**状态机**：

```
idle ──点击──> recording ──停止──> processing ──完成──> completed
  │              │                │                │
  │              └──出错──> error │                │
  │                             └──出错──> error   │
  │                                            │
  └──────────────重新评测───────────────────────┘
```

### 5.3 EvaluationResult 组件

**Props**：

```typescript
interface EvaluationResult {
  totalScore: number;                    // 综合得分 0-100
  syllableResults: SyllableResult[];     // 逐音节结果
  feedback: string;                      // 综合反馈
  recognizedText?: string;                // 识别到的文本（用于调试）
}

interface SyllableResult {
  char: string;                          // 汉字
  pinyin: string;                       // 标准拼音
  recognizedPinyin?: string;              // 识别到的拼音
  isCorrect: boolean;                    // 是否正确
  initialScore: number;                  // 声母得分
  finalScore: number;                    // 韵母得分
  toneScore: number;                     // 声调得分
  feedback?: string;                     // 针对此音节的反馈
}
```

### 5.4 PinyinStrip 更新

**Props 新增**：

```typescript
interface PinyinStripProps {
  segments: PinyinSegment[];
  activeIndex: number;
  onSelect: (index: number) => void;

  // [NEW] 评测结果叠加
  evaluationResult?: EvaluationResult;    // 可选，评测结果
  onSyllableClick?: (syllable: SyllableResult) => void;  // 点击音节回调
}
```

**高亮样式**：

| 状态 | 样式 |
|------|------|
| 正确 | `border-l-2 border-green-500 bg-green-50` + ✓ 图标 |
| 需改进 | `border-l-2 border-red-500 bg-red-50` + ✗ 图标 |
| 未评测 | 保持原样（白底灰边） |

---

## 六、国际化

### 6.1 新增翻译 Key

```typescript
// lib/i18n/types.ts 新增
| "eval.title"
| "eval.targetWord"
| "eval.instruction"
| "eval.startRecording"
| "eval.recording"
| "eval.processing"
| "eval.result"
| "eval.totalScore"
| "eval.syllableAnalysis"
| "eval.feedback"
| "eval.retry"
| "eval.watchVideo"
| "eval.correct"
| "eval.needsImprovement"
| "eval.initial"
| "eval.final"
| "eval.tone"
| "eval.errorPermission"
| "eval.errorNotSupported"
| "eval.errorNoSpeech"
| "eval.errorNoMatch"
| "eval.errorNetwork"
```

### 6.2 中文翻译示例

```typescript
"eval.title": "发音评测",
"eval.targetWord": "目标字词",
"eval.instruction": "请用普通话清晰朗读上方字词",
"eval.startRecording": "开始录音",
"eval.recording": "录音中...",
"eval.processing": "分析中...",
"eval.result": "评测结果",
"eval.totalScore": "综合得分",
"eval.syllableAnalysis": "逐音节分析",
"eval.feedback": "发音建议",
"eval.retry": "重新评测",
"eval.watchVideo": "观看舌位视频",
"eval.correct": "正确",
"eval.needsImprovement": "需改进",
"eval.errorPermission": "请允许浏览器使用麦克风，以便进行发音评测",
"eval.errorNotSupported": "当前浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器",
```

---

## 七、错误处理

### 7.1 错误类型与处理

| ErrorCode | 场景 | 用户提示 | 恢复策略 |
|-----------|------|---------|---------|
| `PERMISSION_DENIED` | 麦克风权限被拒绝 | "请允许浏览器使用麦克风..." | 显示权限设置指引 |
| `NOT_SUPPORTED` | 浏览器不支持 Speech API | "当前浏览器不支持..." | 建议使用 Chrome/Edge |
| `NO_SPEECH` | 未检测到语音 | "未检测到发音..." | 自动重试或手动重试 |
| `NO_MATCH` | 识别结果与目标不符 | "听到的内容与目标不符..." | 提示清晰朗读 |
| `NETWORK_ERROR` | 网络问题 | "语音服务暂时不可用..." | 检查网络后重试 |
| `UNKNOWN` | 其他未知错误 | "发生未知错误..." | 提供技术支持联系方式 |

### 7.2 降级策略

当 Web Speech API 不可用时：
1. 显示浏览器兼容性提示
2. 隐藏发音评测区域
3. 不影响现有视频学习功能

---

## 八、浏览器兼容性

| 浏览器 | 版本 | 支持情况 | 备注 |
|--------|------|---------|------|
| Chrome | 33+ | ✅ 完全支持 | 推荐使用 |
| Edge | 79+ | ✅ 完全支持 | Chromium 内核 |
| Safari | 14.1+ | ⚠️ 部分支持 | 需测试中文识别 |
| Firefox | 所有版本 | ❌ 不支持 | 显示兼容性提示 |
| Opera | 80+ | ✅ 完全支持 | Chromium 内核 |
| iOS Safari | 14.5+ | ⚠️ 部分支持 | 需测试 |
| Chrome Android | 所有版本 | ✅ 完全支持 | 推荐移动端使用 |

**兼容性检测代码**：

```typescript
const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window ||
     'webkitSpeechRecognition' in window);
};
```

---

## 九、性能考虑

### 9.1 音频处理

- 录音时长限制：最长 10 秒（防止无限录音）
- 音频格式：webm（Chrome/Edge 支持良好）
- 实时识别：使用 `continuous: true` + `interimResults: true` 实现边录边识别

### 9.2 评分计算

- 本地计算，无网络延迟
- 使用 `useMemo` 缓存评测结果，避免重复计算

### 9.3 首次加载

- 评测相关代码使用动态导入（React.lazy）
- 仅当用户进入 /lab 页面且有拼音查询结果时才加载

---

## 十、可访问性 (A11y)

### 10.1 必需的无障碍支持

- [x] 麦克风按钮：`aria-label="开始录音"`
- [x] 录音状态：`aria-live="polite"` 区域播报状态变化
- [x] 评分展示：`role="status"` 播报评测结果
- [x] 错误提示：`role="alert"` 紧急错误立即播报
- [x] 键盘操作：Tab 导航 + Enter/Space 触发操作
- [x] 焦点管理：评测完成后焦点移到结果区域

### 10.2 屏幕阅读器支持

- 录音开始："开始录音，请说话"
- 录音结束："录音结束，正在分析"
- 评测完成："评测完成，综合得分 78 分，2 个音节中 1 个正确，1 个需改进"

---

## 十一、测试计划

### 11.1 功能测试

| 测试用例 | 输入 | 预期结果 | 状态 |
|---------|------|---------|------|
| Chrome 麦克风录音 | 点击按钮 | 成功录制音频 | 待测试 |
| 语音识别中文 | 说"妈妈" | 识别出"妈妈" | 待测试 |
| 完全匹配评分 | 识别"妈妈" vs 目标"妈妈" | 得分 100 分 | 待测试 |
| 声母错误评分 | 识别"啊啊啊" vs 目标"妈妈" | 得分 < 60 分 | 待测试 |
| 浏览器不支持 | Firefox 环境 | 显示兼容性提示 | 待测试 |

### 11.2 兼容性测试

| 环境 | 预期结果 |
|------|---------|
| Chrome 桌面端 | 完全正常 |
| Edge 桌面端 | 完全正常 |
| Safari 桌面端 | 部分功能可用 |
| iOS Safari | 部分功能可用 |
| Chrome Android | 完全正常 |

---

## 十二、实现优先级

| 优先级 | 任务 | 预计工时 |
|--------|------|---------|
| P0 | `useSpeechRecognition` hook | 2h |
| P0 | `lib/evaluate.ts` 评测逻辑 | 2h |
| P0 | `PronunciationEvaluator` 组件 | 3h |
| P0 | `EvaluationResult` 组件 | 2h |
| P0 | `/lab` 页面集成 | 2h |
| P1 | `PinyinStrip` 结果高亮 | 1h |
| P1 | 国际化翻译 | 1h |
| P2 | 浏览器兼容性测试与修复 | 2h |
| P2 | 可访问性测试与修复 | 1h |

**总预计工时**: 约 16 小时

---

## 十三、里程碑

| 阶段 | 交付物 | 验收标准 |
|------|--------|---------|
| Phase 1 | 核心录音 + 识别功能 | Chrome 下可完整录制并识别语音 |
| Phase 2 | 评分 + 结果展示 | 评测结果正确显示在 PinyinStrip 上 |
| Phase 3 | 错误处理 + 兼容性 | 优雅降级，支持主流浏览器 |
| Phase 4 | 国际化 + A11y | 三语支持，屏幕阅读器可用 |

---

## 十四、参考文档

- [MDN Web Docs: SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [Web Speech API 中文语音识别](https://blog.csdn.net/hongkid/article/details/142819813)
- PinyinLab 设计系统: `DESIGN.md`
- PinyinLab 产品规范: `PRODUCT.md`

---

*设计文档版本: 1.0*
*最后更新: 2026-06-16*
*审批状态: 已批准*
