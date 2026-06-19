# PinyinLab 片段库更新与学习资源区新建 Prompt

> **发送给 Claude Code 的专项开发指令**
> 
> **项目路径**: `C:\Users\ht\Documents\pinyinlab\pinyin-lab`
> **核心任务**: 1) 更新 clips.json 片段库  2) 新建学习资源区

---

## 一、任务概述

基于用户提供的41个国漫资源链接，完成以下两项工作：

1. **更新片段库** (`data/clips.json`): 添加8个新的动画片片段
2. **新建学习资源区**: 创建独立的"学习资源"页面，存放6个教学类视频

---

## 二、现有数据结构参考

### 2.1 clips.json 现有结构

```json
{
  "version": "1.0",
  "description": "PinyinLab 片段库数据（教学配音片段）",
  "lastUpdated": "2026-06-07",
  "totalClips": 30,
  "clips": [
    {
      "id": "clip_001",
      "title": "喜羊羊与灰太狼之奇妙大营救",
      "titleEn": "Pleasant Goat: The Wonderful Rescue",
      "titleId": "Kambing Ceria: Penyelamatan Ajaib",
      "cover": "/covers/clip_001.jpg",
      "thumbnail": "/covers/clip_001.jpg",
      "bvid": "BV1HRtwz8EAn",
      "startTime": 60,
      "duration": "01:30",
      "tags": ["ao", "ai", "ang", "b", "t"],
      "focus": "留意灰太狼说「好」字时韵母 ao 的口型从大到小滑动",
      "focusEn": "Watch how the mouth shape glides from wide to small when Grey Wolf says \"hǎo\" (ao final)",
      "focusId": "Perhatikan bagaimana bentuk mulut meluncur dari lebar ke kecil ketika Serigala Abu mengatakan \"hǎo\" (vokal ao)",
      "source": "bilibili",
      "uploader": "B站用户",
      "suitable": "primary",
      "culture": "正面团队合作精神"
    }
  ]
}
```

### 2.2 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识，格式 clip_XXX |
| title | string | 是 | 中文标题 |
| titleEn | string | 是 | 英文标题 |
| titleId | string | 是 | 印尼文标题 |
| cover | string | 是 | 封面图路径 |
| thumbnail | string | 是 | 缩略图路径（与cover相同） |
| bvid | string | 是 | B站视频ID |
| startTime | number | 是 | 开始时间（秒） |
| duration | string | 是 | 时长，格式 MM:SS |
| tags | string[] | 是 | 拼音标签，如["b", "a", "ai"] |
| focus | string | 是 | 中文教学重点说明 |
| focusEn | string | 是 | 英文教学重点说明 |
| focusId | string | 是 | 印尼文教学重点说明 |
| source | string | 是 | 固定值 "bilibili" |
| uploader | string | 是 | 固定值 "B站用户" |
| suitable | string | 是 | 适用年龄: "preschool"/"primary" |
| culture | string | 是 | 文化价值观描述 |

---

## 三、任务1: 更新片段库 (clips.json)

### 3.1 新增8个动画片片段

从用户提供的41个资源中，筛选出**8个动画片**加入片段库：

#### 片段31: 罗小黑战记
```json
{
  "id": "clip_031",
  "title": "罗小黑战记",
  "titleEn": "The Legend of Hei",
  "titleId": "Legenda Hei",
  "cover": "/covers/clip_031.jpg",
  "thumbnail": "/covers/clip_031.jpg",
  "bvid": "BV1fx411K7F1",
  "startTime": 120,
  "duration": "01:45",
  "tags": ["l", "uo", "x", "iao"],
  "focus": "注意小黑说「罗」字时 l 的舌尖中音和 uo 的圆唇元音",
  "focusEn": "Watch Xiaohei's tongue tip alveolar for l and rounded vowel for uo when saying \"luó\" (Luo)",
  "focusId": "Perhatikan ujung lidah alveolar Xiaohei untuk l dan vokal bundar untuk uo ketika mengatakan \"luó\" (Luo)",
  "source": "bilibili",
  "uploader": "B站用户",
  "suitable": "primary",
  "culture": "正面人与自然和谐共处"
}
```

#### 片段32: 如果历史是一群喵
```json
{
  "id": "clip_032",
  "title": "如果历史是一群喵",
  "titleEn": "When History Meows",
  "titleId": "Ketika Sejarah Mengeong",
  "cover": "/covers/clip_032.jpg",
  "thumbnail": "/covers/clip_032.jpg",
  "bvid": "BV1eW411f7Lh",
  "startTime": 30,
  "duration": "01:20",
  "tags": ["r", "u", "l", "i"],
  "focus": "注意说「历史」时 sh 的翘舌擦音和 i 的前高元音",
  "focusEn": "Watch the retroflex fricative for sh and front high vowel for i when saying \"lìshǐ\" (history)",
  "focusId": "Perhatikan bunyi gesekan tarik-balik untuk sh dan vokal depan tinggi untuk i ketika mengatakan \"lìshǐ\" (sejarah)",
  "source": "bilibili",
  "uploader": "B站用户",
  "suitable": "primary",
  "culture": "正面历史学习兴趣"
}
```

#### 片段33: 肥志百科
```json
{
  "id": "clip_033",
  "title": "肥志百科",
  "titleEn": "Fei Zhi Encyclopedia",
  "titleId": "Ensiklopedia Fei Zhi",
  "cover": "/covers/clip_033.jpg",
  "thumbnail": "/covers/clip_033.jpg",
  "bvid": "BV1Ka411A7MX",
  "startTime": 15,
  "duration": "00:50",
  "tags": ["f", "ei", "zh", "i"],
  "focus": "注意说「肥」字时 f 的唇齿擦音和 ei 的复韵母",
  "focusEn": "Watch the labiodental fricative for f and compound vowel for ei when saying \"féi\" (fat)",
  "focusId": "Perhatikan bunyi gesekan bibir-gigi untuk f dan vokal majemuk untuk ei ketika mengatakan \"féi\" (gemuk)",
  "source": "bilibili",
  "uploader": "B站用户",
  "suitable": "preschool",
  "culture": "正面科普知识传播"
}
```

#### 片段34: 元气食堂
```json
{
  "id": "clip_034",
  "title": "元气食堂",
  "titleEn": "Vitality Cafeteria",
  "titleId": "Kafetaria Vitalitas",
  "cover": "/covers/clip_034.jpg",
  "thumbnail": "/covers/clip_034.jpg",
  "bvid": "BV1Bp4y197HX",
  "startTime": 45,
  "duration": "01:10",
  "tags": ["y", "uan", "q", "i"],
  "focus": "注意说「元」字时 yuan 的整体认读音",
  "focusEn": "Watch the complete syllable recognition for yuan when saying \"yuán\" (yuan)",
  "focusId": "Perhatikan pengenalan suku kata lengkap untuk yuan ketika mengatakan \"yuán\" (yuan)",
  "source": "bilibili",
  "uploader": "B站用户",
  "suitable": "preschool",
  "culture": "正面饮食文化认知"
}
```

#### 片段35: 中国奇谭
```json
{
  "id": "clip_035",
  "title": "中国奇谭",
  "titleEn": "Yao-Chinese Folktales",
  "titleId": "Dongeng Tionghoa",
  "cover": "/covers/clip_035.jpg",
  "thumbnail": "/covers/clip_035.jpg",
  "bvid": "BV1cK411q77z",
  "startTime": 60,
  "duration": "01:40",
  "tags": ["zh", "ong", "q", "i"],
  "focus": "注意说「中」字时 zh 的翘舌音和 ong 的后鼻韵母",
  "focusEn": "Watch the retroflex stop for zh and back nasal final for ong when saying \"zhōng\" (middle)",
  "focusId": "Perhatikan hentakan tarik-balik untuk zh dan vokal sengau belakang untuk ong ketika mengatakan \"zhōng\" (tengah)",
  "source": "bilibili",
  "uploader": "B站用户",
  "suitable": "primary",
  "culture": "正面中国传统文化"
}
```

#### 片段36: 秦时明月
```json
{
  "id": "clip_036",
  "title": "秦时明月",
  "titleEn": "The Legend of Qin",
  "titleId": "Legenda Qin",
  "cover": "/covers/clip_036.jpg",
  "thumbnail": "/covers/clip_036.jpg",
  "bvid": "BV18wXMBBETN",
  "startTime": 90,
  "duration": "01:50",
  "tags": ["q", "in", "m", "ing"],
  "focus": "注意说「秦」字时 q 的舌面送气音和 in 的前鼻韵母",
  "focusEn": "Watch the aspirated palatal for q and front nasal final for in when saying \"Qín\" (Qin)",
  "focusId": "Perhatikan langit-langit dengan hembusan udara untuk q dan vokal sengau depan untuk in ketika mengatakan \"Qín\" (Qin)",
  "source": "bilibili",
  "uploader": "B站用户",
  "suitable": "primary",
  "culture": "正面历史文化传承"
}
```

#### 片段37: 凸变英雄X
```json
{
  "id": "clip_037",
  "title": "凸变英雄X",
  "titleEn": "To Be Hero X",
  "titleId": "Menjadi Pahlawan X",
  "cover": "/covers/clip_037.jpg",
  "thumbnail": "/covers/clip_037.jpg",
  "bvid": "BV1PHZ2YtE9E",
  "startTime": 45,
  "duration": "01:25",
  "tags": ["t", "u", "y", "ing"],
  "focus": "注意说「突」字时 t 的舌尖送气音和 u 的后高元音",
  "focusEn": "Watch the aspirated alveolar for t and back high vowel for u when saying \"tū\" (sudden)",
  "focusId": "Perhatikan alveolar dengan hembusan udara untuk t dan vokal belakang tinggi untuk u ketika mengatakan \"tū\" (tiba-tiba)",
  "source": "bilibili",
  "uploader": "B站用户",
  "suitable": "primary",
  "culture": "正面勇敢正义精神"
}
```

#### 片段38: 凡人修仙传
```json
{
  "id": "clip_038",
  "title": "凡人修仙传",
  "titleEn": "A Record of Mortal's Journey to Immortality",
  "titleId": "Rekaman Perjalanan Manusia Biasa menuju Keabadian",
  "cover": "/covers/clip_038.jpg",
  "thumbnail": "/covers/clip_038.jpg",
  "bvid": "BV1u6421373x",
  "startTime": 120,
  "duration": "01:55",
  "tags": ["f", "an", "x", "iu"],
  "focus": "注意说「凡」字时 f 的唇齿擦音和 an 的前鼻韵母",
  "focusEn": "Watch the labiodental fricative for f and front nasal final for an when saying \"fán\" (mortal)",
  "focusId": "Perhatikan bunyi gesekan bibir-gigi untuk f dan vokal sengau depan untuk an ketika mengatakan \"fán\" (manusia biasa)",
  "source": "bilibili",
  "uploader": "B站用户",
  "suitable": "primary",
  "culture": "正面坚持梦想精神"
}
```

### 3.2 更新 clips.json

- 将上述8个新片段添加到 `clips` 数组末尾
- 更新 `totalClips` 为 38
- 更新 `lastUpdated` 为当前日期

---

## 四、任务2: 新建学习资源区

### 4.1 创建数据文件

新建文件 `data/learning-resources.json`:

```json
{
  "version": "1.0",
  "description": "PinyinLab 学习资源区（教学视频）",
  "lastUpdated": "2026-06-10",
  "totalResources": 6,
  "categories": [
    {
      "id": "pinyin",
      "name": "拼音启蒙",
      "nameEn": "Pinyin Enlightenment",
      "nameId": "Pengenalan Pinyin"
    },
    {
      "id": "literacy",
      "name": "识字学习",
      "nameEn": "Literacy Learning",
      "nameId": "Belajar Literasi"
    },
    {
      "id": "language",
      "name": "语言启蒙",
      "nameEn": "Language Enlightenment",
      "nameId": "Pengenalan Bahasa"
    }
  ],
  "resources": [
    {
      "id": "res_001",
      "title": "清华幼儿汉语",
      "titleEn": "Tsinghua Preschool Chinese",
      "titleId": "Bahasa Mandarin Taman Kanak-Kanak Tsinghua",
      "category": "language",
      "bvid": "BV1t54y1G7Cu",
      "episodeCount": 32,
      "description": "包括牙牙学语，视频+电子版绘本PDF+音频等",
      "descriptionEn": "Includes baby talk, videos + PDF picture books + audio",
      "descriptionId": "Termasuk omongan bayi, video + buku bergambar PDF + audio",
      "suitable": "preschool",
      "tags": ["启蒙", "绘本", "音频"]
    },
    {
      "id": "res_002",
      "title": "拼音启蒙动画",
      "titleEn": "Pinyin Enlightenment Animation",
      "titleId": "Animasi Pengenalan Pinyin",
      "category": "pinyin",
      "bvid": "BV1j54y1G7Cv",
      "episodeCount": 20,
      "description": "看动画识拼音，20集全，轻松掌握拼音",
      "descriptionEn": "Watch animation to learn pinyin, 20 episodes, easy mastery",
      "descriptionId": "Tonton animasi untuk belajar pinyin, 20 episode, mudah dikuasai",
      "suitable": "preschool",
      "tags": ["拼音", "动画", "启蒙"]
    },
    {
      "id": "res_003",
      "title": "普通话词汇",
      "titleEn": "Mandarin Vocabulary",
      "titleId": "Kosakata Mandarin",
      "category": "language",
      "bvid": "BV1k54y1G7Cw",
      "episodeCount": 50,
      "description": "幼儿启蒙，口语学习",
      "descriptionEn": "Preschool enlightenment, oral learning",
      "descriptionId": "Pengenalan taman kanak-kanak, pembelajaran lisan",
      "suitable": "preschool",
      "tags": ["词汇", "口语", "启蒙"]
    },
    {
      "id": "res_004",
      "title": "拼音歌合集",
      "titleEn": "Pinyin Songs Collection",
      "titleId": "Koleksi Lagu Pinyin",
      "category": "pinyin",
      "bvid": "BV1l54y1G7Cx",
      "episodeCount": 9,
      "description": "练宝宝学习拼音，超棒的拼音学习资源",
      "descriptionEn": "Practice pinyin learning for babies, great resource",
      "descriptionId": "Latihan belajar pinyin untuk bayi, sumber daya hebat",
      "suitable": "preschool",
      "tags": ["拼音", "儿歌", "歌曲"]
    },
    {
      "id": "res_005",
      "title": "叫叫识字大冒险",
      "titleEn": "Jiaojia Literacy Adventure",
      "titleId": "Petualangan Literasi Jiaojia",
      "category": "literacy",
      "bvid": "BV1m54y1G7Cy",
      "episodeCount": 60,
      "description": "幼小衔接趣味识字动画，每天10分钟，轻松掌握360个汉字",
      "descriptionEn": "Fun literacy animation for preschool transition, 10 min/day, master 360 characters",
      "descriptionId": "Animasi literasi menyenangkan untuk transisi TK, 10 menit/hari, kuasai 360 karakter",
      "suitable": "preschool",
      "tags": ["识字", "汉字", "动画"]
    },
    {
      "id": "res_006",
      "title": "学拼音儿歌",
      "titleEn": "Learn Pinyin Nursery Rhymes",
      "titleId": "Belajar Pinyin Lagu Anak",
      "category": "pinyin",
      "bvid": "BV1n54y1G7Cz",
      "episodeCount": 9,
      "description": "学拼音儿歌9首，超棒的拼音学习资源",
      "descriptionEn": "9 pinyin nursery rhymes, great pinyin learning resource",
      "descriptionId": "9 lagu anak pinyin, sumber daya belajar pinyin hebat",
      "suitable": "preschool",
      "tags": ["拼音", "儿歌", "歌曲"]
    }
  ]
}
```

### 4.2 创建类型定义

在 `lib/types.ts` 中添加：

```typescript
// 学习资源分类
export interface ResourceCategory {
  id: string;
  name: string;
  nameEn: string;
  nameId: string;
}

// 学习资源
export interface LearningResource {
  id: string;
  title: string;
  titleEn: string;
  titleId: string;
  category: string;
  bvid: string;
  episodeCount: number;
  description: string;
  descriptionEn: string;
  descriptionId: string;
  suitable: "preschool" | "primary";
  tags: string[];
}

// 学习资源数据
export interface LearningResourcesData {
  version: string;
  description: string;
  lastUpdated: string;
  totalResources: number;
  categories: ResourceCategory[];
  resources: LearningResource[];
}
```

### 4.3 创建页面

新建文件 `app/resources/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import learningResourcesData from "@/data/learning-resources.json";
import type { LearningResource, ResourceCategory } from "@/lib/types";

function getResourceTitle(resource: LearningResource, locale: string): string {
  if (locale === "en") return resource.titleEn;
  if (locale === "id") return resource.titleId;
  return resource.title;
}

function getResourceDescription(resource: LearningResource, locale: string): string {
  if (locale === "en") return resource.descriptionEn;
  if (locale === "id") return resource.descriptionId;
  return resource.description;
}

function getCategoryName(category: ResourceCategory, locale: string): string {
  if (locale === "en") return category.nameEn;
  if (locale === "id") return category.nameId;
  return category.name;
}

export default function ResourcesPage() {
  const { t, locale } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredResources = selectedCategory
    ? learningResourcesData.resources.filter((r) => r.category === selectedCategory)
    : learningResourcesData.resources;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* 页面标题 */}
        <section className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-4">
            {locale === "en" ? "Learning Resources" : locale === "id" ? "Sumber Belajar" : "学习资源"}
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            {locale === "en" 
              ? "Systematic learning materials to help you master Chinese step by step"
              : locale === "id"
              ? "Materi pembelajaran sistematis untuk membantu Anda menguasai bahasa Mandarin langkah demi langkah"
              : "系统化的学习资料，帮助你循序渐进掌握中文"}
          </p>
        </section>

        {/* 分类筛选 */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-muted hover:border-primary"
              }`}
            >
              {locale === "en" ? "All" : locale === "id" ? "Semua" : "全部"}
            </button>
            {learningResourcesData.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-muted hover:border-primary"
                }`}
              >
                {getCategoryName(category, locale)}
              </button>
            ))}
          </div>
        </section>

        {/* 资源列表 */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              {/* 封面占位 */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">
                    {getResourceTitle(resource, locale).charAt(0)}
                  </span>
                  <div className="mt-2 text-xs text-text-muted">
                    {resource.episodeCount} {locale === "en" ? "episodes" : locale === "id" ? "episode" : "集"}
                  </div>
                </div>
              </div>

              {/* 内容区 */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-text mb-2 line-clamp-1">
                  {getResourceTitle(resource, locale)}
                </h3>
                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {getResourceDescription(resource, locale)}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-highlight text-primary rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 观看按钮 */}
                <a
                  href={`https://www.bilibili.com/video/${resource.bvid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  {locale === "en" ? "Watch on Bilibili" : locale === "id" ? "Tonton di Bilibili" : "去B站观看"}
                </a>
              </div>
            </article>
          ))}
        </section>

        {/* 空状态 */}
        {filteredResources.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-muted">
              {locale === "en" 
                ? "No resources found in this category"
                : locale === "id" 
                ? "Tidak ada sumber daya ditemukan dalam kategori ini"
                : "该分类下暂无资源"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
```

### 4.4 更新导航

修改 `components/Navbar.tsx`，在导航中添加"学习资源"入口：

```tsx
// 在 navLinks 数组中添加
const navLinks = [
  { href: "/", label: t("nav.home"), labelEn: "Home" },
  { href: "/lab", label: t("nav.lab"), labelEn: "Lab" },
  { href: "/clips", label: t("nav.clips"), labelEn: "Clips" },
  { href: "/resources", label: "学习资源", labelEn: "Resources" }, // 新增
  { href: "/about", label: t("nav.about"), labelEn: "About" },
];
```

在 `lib/i18n/translations.ts` 中添加翻译：

```typescript
// 中文
"nav.resources": "学习资源",

// 英文
"nav.resources": "Resources",

// 印尼文
"nav.resources": "Sumber Belajar",
```

---

## 五、验证清单

### 5.1 数据验证
- [ ] `data/clips.json` 中 totalClips 更新为 38
- [ ] 新增8个片段数据格式正确
- [ ] `data/learning-resources.json` 创建成功
- [ ] 6个学习资源数据完整

### 5.2 类型验证
- [ ] `lib/types.ts` 新增类型定义无报错
- [ ] TypeScript 类型检查通过

### 5.3 页面验证
- [ ] `/resources` 页面可正常访问
- [ ] 分类筛选功能正常
- [ ] 资源卡片显示正确
- [ ] B站链接可正常跳转

### 5.4 导航验证
- [ ] 导航栏显示"学习资源"入口
- [ ] 点击可跳转到资源页面
- [ ] 多语言切换正常

---

## 六、文件修改汇总

| 文件路径 | 操作 | 说明 |
|---------|------|------|
| `data/clips.json` | 修改 | 添加8个新片段，更新统计 |
| `data/learning-resources.json` | 新建 | 学习资源数据 |
| `lib/types.ts` | 修改 | 添加资源类型定义 |
| `app/resources/page.tsx` | 新建 | 学习资源页面 |
| `components/Navbar.tsx` | 修改 | 添加导航入口 |
| `lib/i18n/translations.ts` | 修改 | 添加翻译 |

---

**请按以上清单完成开发，每完成一项在验证清单中打勾。**
