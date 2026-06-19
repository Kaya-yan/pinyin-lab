# 任务计划：PinyinLab 发音评测功能实现

## 目标
在现有 /lab 页面中集成纯前端发音评测功能，使用 Web Speech API 实现中文语音识别，提供评分反馈和舌位学习建议。

## 设计规格
详见 `docs/superpowers/specs/2026-06-16-pronunciation-evaluation-design.md`

## 当前阶段
阶段 1

## 各阶段

### 阶段 1：核心类型定义与评测逻辑 (P0)
- [x] 创建 `lib/evaluate.types.ts` - 评测相关 TypeScript 类型
- [x] 创建 `lib/evaluate.ts` - 评测算法：文本对比 + 分数计算 + 反馈生成
- [x] 实现混淆音对照表（zh/z, ch/c, sh/s 等）
- [x] 实现评分维度：声母(40%) + 韵母(40%) + 声调(20%)
- **状态：** complete

### 阶段 2：语音识别 Hook (P0)
- [x] 创建 `hooks/useSpeechRecognition.ts` - 封装 MediaRecorder + Web Speech API
- [x] 实现浏览器兼容性检测
- [x] 实现录音状态机：idle → recording → processing → completed
- [x] 实现错误处理：权限、不支持、无语音、无匹配、网络
- **状态：** complete

### 阶段 3：评测 UI 组件 (P0)
- [x] 创建 `components/PronunciationEvaluator.tsx` - 麦克风按钮 + 录音状态
- [x] 创建 `components/EvaluationResult.tsx` - 评分展示 + 错误高亮 + 反馈
- [x] 更新 `components/PinyinStrip.tsx` - 支持评测结果叠加高亮
- **状态：** complete

### 阶段 4：页面集成 (P0)
- [x] 更新 `app/lab/page.tsx` - 集成 PronunciationEvaluator 组件
- [x] 添加评测结果状态管理
- [x] 实现 PinyinStrip 错误高亮交互
- **状态：** complete

### 阶段 5：国际化 (P1)
- [x] 更新 `lib/i18n/types.ts` - 添加 eval.* 翻译键
- [x] 更新 `lib/i18n/zh.ts` - 添加中文翻译
- [x] 更新 `lib/i18n/en.ts` - 添加英文翻译
- [x] 更新 `lib/i18n/id.ts` - 添加印尼文翻译
- **状态：** complete

### 阶段 6：可访问性与测试 (P2)
- [x] 添加 ARIA 属性：aria-label, aria-live, role="alert"
- [x] 实现键盘操作：Tab 导航 + Enter/Space 触发
- [ ] 浏览器兼容性测试（Chrome/Edge/Safari/Firefox）- 需手动测试
- [x] 性能优化：组件条件渲染已实现按需加载
- **状态：** complete

## 关键问题
1. Web Speech API 在 Safari 中文识别的准确度如何？
2. 如何处理识别结果与目标文本部分匹配的情况？
3. 评测组件是否应该在用户未查询时隐藏？

## 已做决策
| 决策 | 理由 |
|------|------|
| 使用 Web Speech API | 浏览器内置，支持中文，零成本 |
| 纯前端实现 | 无后端依赖，部署简单 |
| 评分算法本地实现 | 基于 pinyinMap.json，无外部依赖 |
| 延迟加载评测组件 | 减少首屏加载时间 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
|      | 1       |         |

## 备注
- 随着进度更新阶段状态：pending → in_progress → complete
- 做重大决策前重新读取此计划（注意力操纵）
- 记录所有错误，避免重复
- 设计规格文档路径：`docs/superpowers/specs/2026-06-16-pronunciation-evaluation-design.md`
