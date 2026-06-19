# PinyinLab

PinyinLab 是一个面向海外低龄汉语学习者的纯前端静态教学工具。它用动态舌位视频替代平面口型示意，帮助教师和学生在弱网课堂环境中完成“查汉字 → 看拼音 → 播放舌位 → 找教学片段”的发音教学链路。

## 当前正式范围

正式产品包含 3 个页面：

- `/`：产品入口与定位说明页
- `/lab`：发音实验室，承担核心教学链路
- `/clips`：片段库，承担拼音筛选与片段预览

正式能力：

- 中文 / English / Bahasa Indonesia 三语界面
- 汉字转拼音与音节拆解
- 本地舌位视频 / GIF 播放
- 基于拼音标签的相关片段推荐
- Bilibili 片段嵌入预览

实验性能力：

- 发音评测（位于 `/lab`，保留实现，但不作为主产品卖点）

不属于正式产品的内容：

- 内部过渡动画试验页 `/transition-demo`
- 历史 Prompt、审查稿、竞品分析与早期方案稿

## 产品定位

- **目标用户**：海外低龄中文学习者、课堂教师、家长辅助者
- **使用环境**：教室投影、平板、普通浏览器、弱网环境
- **产品气质**：学术、克制、可信，像实验室仪器而不是营销页面或游戏化应用

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- pinyin-pro
- 静态导出：`output: 'export'`

## 运行方式

在项目根目录执行：

```bash
npm install
npm run dev
```

默认开发地址：`http://localhost:3000`

常用命令：

```bash
npm run dev
npm run build
npm run lint
```

## 项目结构

```text
app/
├── page.tsx              # 首页
├── lab/page.tsx          # 发音实验室
├── clips/page.tsx        # 片段库
├── layout.tsx            # 根布局
└── globals.css           # 全局样式

components/               # 共享组件
lib/                      # 拼音解析、类型、i18n、评测逻辑
hooks/                    # 浏览器能力封装（TTS / SpeechRecognition）
data/
├── pinyinMap.json        # 拼音到媒体资源映射
└── clips.json            # 片段库数据
public/
├── videos/               # 声母 MOV、韵母 MP4
├── gif/initials/         # 声母 GIF
└── covers/               # 片段封面图
```

## 数据与媒体资源

当前仓库内已整理的核心媒体资源：

- 23 个声母视频（`public/videos/initials/`）
- 36 个韵母视频（`public/videos/finals/`）
- 23 个声母 GIF（`public/gif/initials/`）
- 22 张片段封面图（`public/covers/`）

核心数据文件：

- `data/pinyinMap.json`：声母 / 韵母到视频与 GIF 的映射
- `data/clips.json`：教学片段元数据、标签与教学聚焦说明

## 设计与实现原则

- 保持静态站点结构，不引入后端依赖
- 优先保证教室投影可读性和儿童触控可用性
- 核心教学页面避免阴影、渐变和装饰性动效
- 不依赖运行时外链字体，优先使用系统字体栈
- 页面结构尽量稳定，避免为展示效果牺牲教学主链路

## 文档分工

当前事实源文档：

- `README.md`：项目总览与运行说明
- `PRODUCT.md`：产品边界与正式能力定义
- `DESIGN.md`：当前生效的设计系统与界面规则

历史资料归档位置：

- `docs/archive/prompts/`
- `docs/archive/reviews/`
- `docs/archive/research/`
- `docs/archive/experiments/`

这些归档材料仅供回溯参考，不作为当前事实源。
