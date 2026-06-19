# PinyinLab 首页入场动画设计规格

**日期**: 2026-06-15
**状态**: 已批准
**设计方向**: 渐变遮罩揭示 + 拼音气泡弹跳

---

## 1. 概述

为 PinyinLab 首页设计两层动画系统：
1. **全屏入场动画 (Splash Screen)** - 用户首次访问时播放的品牌展示动画
2. **页面入场动画 (Page Entrance)** - 首页内容的弹性弹跳入场效果

**目标用户**: 5-12岁海外华裔儿童
**设计参考**: Apple、Stripe、Linear、Vercel 等高端品牌

---

## 2. 全屏入场动画 (Splash Screen)

### 2.1 动画流程

| 时间点 | 动作 | 说明 |
|--------|------|------|
| 0.0s | 渐变背景出现 | 深蓝渐变，带流动效果 |
| 0.3s | "PINYINLAB" 淡入 | 带发光阴影，缩放+模糊→清晰 |
| 1.0s | 分隔线展开 | 从中心向两侧展开 |
| 1.2s | 副标题淡入 | "看得见的发音" 向上滑入 |
| 1.5s | 跳过按钮出现 | 右下角，半透明背景 |
| 2.5s | 圆形遮罩扩展 | 从中心扩散，揭示首页内容 |
| 3.7s | 首页完全显示 | 入场动画结束 |

**总时长**: 约 3.7 秒
**可跳过**: 是（点击跳过按钮或按任意键）

### 2.2 视觉设计

**渐变背景**:
```css
background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #2C5282 60%, #1e40af 100%);
background-size: 200% 200%;
animation: gradientFlow 4s ease infinite;
```

**背景装饰**:
- 左上角: 蓝色径向渐变光晕 (rgba(96, 165, 250, 0.15))
- 右下角: 金色径向渐变光晕 (rgba(252, 211, 77, 0.1))

**品牌文字**:
```css
/* PINYINLAB */
font-size: 36px;
font-weight: 800;
color: white;
letter-spacing: 8px;
text-shadow: 0 0 60px rgba(96, 165, 250, 0.6);
animation: brandReveal 1s ease-out 0.3s forwards;

/* 副标题 */
font-size: 14px;
color: rgba(255, 255, 255, 0.7);
letter-spacing: 6px;
```

**分隔线**:
```css
width: 40px;
height: 1px;
background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
```

**跳过按钮**:
```css
padding: 6px 16px;
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 20px;
backdrop-filter: blur(10px);
```

### 2.3 遮罩过渡效果

```css
/* 圆形遮罩 */
position: absolute;
top: 50%;
left: 50%;
border-radius: 50%;
background: white;
transform: translate(-50%, -50%);
animation: maskExpand 1.2s cubic-bezier(0.16, 1, 0.3, 1) 2.5s forwards;

@keyframes maskExpand {
  0% { width: 0; height: 0; opacity: 1; }
  70% { opacity: 1; }
  100% { width: 800px; height: 800px; opacity: 0; }
}
```

### 2.4 状态管理

- **首次访问**: 播放入场动画
- **重复访问**: 跳过动画，直接显示首页
- **存储方式**: localStorage `pinyinlab_splash_shown`
- **有效期**: 24小时后可再次播放（可选）

---

## 3. 页面入场动画 (Page Entrance)

### 3.1 动画风格

**风格**: 弹性回弹 (Elastic Bounce)
**缓动函数**: `cubic-bezier(0.34, 1.56, 0.64, 1)`
**参考**: 橡皮球落地回弹效果

### 3.2 元素动画序列

| 元素 | 动画类型 | 延迟 | 说明 |
|------|----------|------|------|
| 导航栏 | slideDown | 0s | 从上方滑入 |
| Hero 标题 | elasticFade | 0.3s | 缩放+淡入 |
| Hero 副标题 | elasticFade | 0.5s | 缩放+淡入 |
| CTA 按钮 | elasticBounce | 0.7s | 弹跳入场 |
| 产品模型 | elasticBounce | 0.9s | 从右侧弹入 |
| 拼音元素 | elasticBounce | 1.4-1.6s | 依次弹入 |
| 功能卡片 | cardBounce | 2.0-2.4s | 依次弹入 |

### 3.3 CSS 关键帧

```css
/* 导航栏滑入 */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 弹性淡入 (标题、副标题) */
@keyframes elasticFade {
  0% { opacity: 0; transform: scale(0.5); }
  70% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}

/* 弹性弹跳 (按钮、模型) */
@keyframes elasticBounce {
  0% { opacity: 0; transform: translateY(40px) scale(0.3); }
  50% { opacity: 1; transform: translateY(-12px) scale(1.15); }
  75% { transform: translateY(4px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* 卡片弹入 */
@keyframes cardBounce {
  0% { opacity: 0; transform: translateY(30px) scale(0.8); }
  60% { opacity: 1; transform: translateY(-6px) scale(1.05); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
```

### 3.4 滚动触发

- 功能卡片使用 Intersection Observer
- 进入视口时触发动画
- 使用 `useInView` hook

---

## 4. 无障碍设计

### 4.1 减少动画

```css
@media (prefers-reduced-motion: reduce) {
  .splash-screen { display: none; }
  .anim-hidden,
  .hero-enter,
  .hero-enter-right {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

### 4.2 跳过机制

- 显示"跳过"按钮
- 支持键盘操作（按任意键跳过）
- 24小时内不重复播放

---

## 5. 性能优化

### 5.1 动画性能

- 使用 `transform` 和 `opacity` 属性（GPU 加速）
- 避免 `filter` 和 `box-shadow` 动画（高开销）
- 使用 `will-change` 提示浏览器优化

### 5.2 加载策略

- 入场动画在页面加载完成后立即开始
- 不阻塞首页内容渲染
- 使用 CSS 动画而非 JavaScript（更好的性能）

---

## 6. 技术实现

### 6.1 组件结构

```
components/
├── SplashScreen.tsx      # 全屏入场动画组件
├── PageEntrance.tsx      # 页面入场动画包装组件
└── AnimatedCard.tsx      # 带滚动触发的卡片组件
```

### 6.2 状态管理

```typescript
// SplashScreen.tsx
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const splashShown = localStorage.getItem('pinyinlab_splash_shown');
  if (!splashShown) {
    setIsVisible(true);
    // 设置24小时过期
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('pinyinlab_splash_shown', expiry.toString());
  }
}, []);
```

### 6.3 集成方式

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <>
      <SplashScreen />
      <PageEntrance>
        {/* 首页内容 */}
      </PageEntrance>
    </>
  );
}
```

---

## 7. 测试要点

- [ ] 首次访问播放入场动画
- [ ] 重复访问跳过动画
- [ ] 跳过按钮功能正常
- [ ] 键盘跳过功能正常
- [ ] 减少动画模式下不播放
- [ ] 移动端显示正常
- [ ] 动画流畅无卡顿
- [ ] 首页内容正常显示

---

## 8. 参考来源

- **Apple** - 产品发布页面的遮罩揭示动画
- **Stripe** - 渐变色彩流动效果
- **Linear** - 极简文字动画
- **Vercel** - 品牌渐变背景
- **Framer** - 字母拆分入场
