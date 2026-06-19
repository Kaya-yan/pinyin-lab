# 发现与决策

## 当前任务：发音评测功能实现

### 设计规格关键点
**来源**: `docs/superpowers/specs/2026-06-16-pronunciation-evaluation-design.md`

### 技术选型
- **语音识别**: Web Speech API (SpeechRecognition) - Chrome 33+, Edge 79+ 完整支持
- **音频录制**: MediaRecorder API - 配合 SpeechRecognition
- **评分计算**: 本地算法 (lib/evaluate.ts) - 基于 pinyinMap.json

### 评分算法
```
总分 = 声母匹配度 × 40% + 韵母匹配度 × 40% + 声调匹配度 × 20%
```

**匹配度规则**:
- 完全正确：100分
- 混淆音（zh/z, ch/c, sh/s, r/l 等）：60分
- 近似韵母（an/ang, en/eng）：70分
- 其他错误：0分

### 混淆音对照表
```typescript
const CONFUSION_PAIRS = {
  zh: ['z'], ch: ['c'], sh: ['s'], r: ['l'],
  n: ['l'], m: ['n'],
  b: ['p'], d: ['t'], g: ['k'],
  an: ['ang'], en: ['eng'], in: ['ing'],
};
```

### 文件依赖关系
```
app/lab/page.tsx
    ├── components/PronunciationEvaluator.tsx
    │       └── hooks/useSpeechRecognition.ts
    ├── components/EvaluationResult.tsx
    │       └── lib/evaluate.ts
    │               ├── lib/evaluate.types.ts
    │               └── data/pinyinMap.json (readonly)
    └── components/PinyinStrip.tsx (更新)
            └── lib/i18n/*.ts (新增翻译)
```

### 新增文件清单 (P0)
1. `hooks/useSpeechRecognition.ts` - 封装 MediaRecorder + Web Speech API
2. `lib/evaluate.ts` - 评测逻辑
3. `lib/evaluate.types.ts` - TypeScript 类型
4. `components/PronunciationEvaluator.tsx` - 评测 UI
5. `components/EvaluationResult.tsx` - 结果展示

### 需要更新的现有文件
1. `components/PinyinStrip.tsx` - 添加 evaluationResult prop 和错误高亮
2. `app/lab/page.tsx` - 集成评测组件
3. `lib/i18n/types.ts` - 添加 eval.* 翻译键
4. `lib/i18n/zh.ts`, `en.ts`, `id.ts` - 添加翻译

### 浏览器兼容性
| 浏览器 | 支持情况 |
|--------|---------|
| Chrome 33+ | ✅ 完全支持 |
| Edge 79+ | ✅ 完全支持 |
| Safari 14.1+ | ⚠️ 部分支持 |
| Firefox | ❌ 不支持 |

### 设计规范
- 48px 最小触控目标
- 学术蓝 #2C5282
- 扁平化零阴影
- 1px 边框 #E2E8F0
- 8px 圆角

### 错误处理场景
1. PERMISSION_DENIED - 麦克风权限被拒绝
2. NOT_SUPPORTED - 浏览器不支持
3. NO_SPEECH - 未检测到语音
4. NO_MATCH - 识别结果不匹配
5. NETWORK_ERROR - 网络问题

### 性能考虑
- 录音时长限制：最长 10 秒
- 使用 useMemo 缓存评测结果
- 评测组件使用 React.lazy 动态导入

---

## 历史任务：入场动画（已完成）

### 需求
- 全屏入场动画：渐变遮罩揭示风格
- 页面入场动画：弹性回弹风格
- 总时长约 3.7 秒，可跳过

### 技术决策
| 决策 | 理由 |
|------|------|
| CSS 动画而非 GSAP | 性能更好，无额外依赖 |
| localStorage 存储状态 | 简单可靠 |
| prefers-reduced-motion | 无障碍最佳实践 |

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
