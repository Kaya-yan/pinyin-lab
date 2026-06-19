---
name: PinyinLab
description: Design system for a static pinyin teaching tool focused on lab-like clarity and classroom readability
type: design-system
colors:
  primary: "#2C5282"
  secondary: "#4A5568"
  background: "#FAFAF8"
  surface: "#FFFFFF"
  text: "#1A202C"
  text-muted: "#718096"
  accent: "#B7791F"
  border: "#E2E8F0"
  highlight: "#EBF4FF"
typography:
  serif: '"Songti SC", "STSong", "Noto Serif SC", Georgia, serif'
  sans: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
---

# Design System: PinyinLab

## 1. North Star

PinyinLab should feel like a classroom instrument: precise, quiet, reliable, and content-first. The interface exists to support pronunciation teaching, not to perform as a branded spectacle.

The visual center of gravity belongs to:
- Chinese characters
- pinyin
- tongue-position media
- teaching clips

Everything else should recede.

## 2. Product Surfaces

### Formal Surfaces

- `/` is the entry page
- `/lab` is the core teaching surface
- `/clips` is the resource surface

### Visual Priority

- `/lab` and `/clips` define the real product language
- `/` may feel slightly more like an entry page, but must still belong to the same system
- experimental modules should never dominate the page

## 3. Design Principles

1. **Content leads**: media and pinyin carry the experience
2. **Classroom readable**: text must remain legible on projection and tablets
3. **Low-friction**: the interface should not ask users to interpret decorative behavior
4. **Flat by default**: borders and background contrast create structure; shadows do not
5. **One interaction color**: academic blue is the primary state color
6. **Motion serves state**: transitions may clarify change, but never become the main event

## 4. Color System

### Primary

- **Academic Blue** `#2C5282`
  - current state
  - focused state
  - active navigation
  - primary buttons
  - progress fill

### Secondary

- **Slate Gray** `#4A5568`
  - icons
  - secondary labels
  - supporting metadata

### Accent

- **Ochre** `#B7791F`
  - reserved for teaching emphasis
  - preferred use: teaching focus callout in the Bilibili modal

### Neutrals

- **Background** `#FAFAF8`
- **Surface** `#FFFFFF`
- **Text** `#1A202C`
- **Muted Text** `#718096`
- **Border** `#E2E8F0`
- **Highlight** `#EBF4FF`

## 5. Typography

### Font Stacks

Use local/system fonts first. Do not rely on runtime font downloads.

- **Serif stack**: `"Songti SC", "STSong", "Noto Serif SC", Georgia, serif`
- **Sans stack**: `"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`

### Roles

- **Brand / section headings**: serif
- **UI, body, pinyin, buttons, labels**: sans

### Target Sizes

- product / section heading: around 24px
- current Chinese word: around 28px
- current pinyin: around 56px
- body text: around 15px
- metadata labels: around 13px

The exact utility classes may vary, but the projection-first hierarchy must remain.

## 6. Shape, Borders, and Spacing

### Radius

- buttons / small controls: 4px
- cards / media frames: 8px
- larger containers / modal shells: 8px–12px

### Borders

- resting border: `1px solid #E2E8F0`
- active emphasis: `2px solid #2C5282` only where state needs to be unmistakable

### Touch Targets

Interactive elements should not fall below **48px** in their smallest usable dimension.

## 7. Motion Rules

### Allowed

- short state transitions
- opacity changes
- border / background / text-color transitions
- subtle one-time page entrance if it helps orientation

### Not Allowed on Formal Product Surfaces

- pulse loops
- bounce / elastic entrance choreography
- floating / lifting cards
- decorative scale growth on hover
- gradient-based spectacle
- glow effects
- splash-screen theater

### Timing

Use fast, quiet transitions. In most places, around **150ms** is the target.

## 8. Component Guidance

### Navbar

- white surface
- bottom border only
- no shadow
- active route shown through color and background tint, not elevation

### Search Inputs

- white background
- 1px neutral border
- focus becomes academic blue
- no glow, no drop shadow

### Pinyin Strip

- cards should read as instructional units, not playful chips
- active state uses blue border + highlight background
- hover may clarify clickability, but should not lift or bounce
- evaluation feedback may add semantic emphasis, but should not replace the core system language

### Video Player

- media is the focal point
- container should remain flat and quiet
- controls should feel functional, not ornamental
- progress indicators should be crisp and readable

### Clip Cards

- flat cards
- no shadow-based depth
- emphasis belongs to title, tags, and preview action
- hover can change border or button fill, but not elevation

### Bilibili Modal

- stable white shell
- muted overlay
- teaching focus callout may use ochre left border
- no decorative blur or theatrical depth

### Experimental Evaluation Module

- keep it visually subordinate to the main teaching flow
- use the same border, spacing, and typography language as the rest of the page
- semantic result colors are acceptable, but should not turn the module into a separate visual system

## 9. Homepage Treatment

The homepage is an entry page, not a separate marketing microsite.

It may:
- explain the product
- show the core value proposition
- provide CTA entry into `/lab`

It must not:
- rely on a full-screen splash sequence
- use strong brand theater that conflicts with `/lab` and `/clips`
- create a second design language based on gradients, glow, or performance-heavy entrance animation

## 10. Accessibility and Environment

- maintain high contrast for projection use
- avoid motion-heavy patterns
- support keyboard navigation
- keep interface readable under weak network conditions and system font fallback
- never make state understandable through color alone

## 11. Do / Don’t Summary

### Do

- keep the product flat, quiet, and readable
- use blue for interaction and current state
- let borders and spacing create structure
- treat `/lab` and `/clips` as the authoritative surfaces of the product
- keep experimental modules visually secondary

### Don’t

- add box shadows to core teaching surfaces
- add gradients to cards, toolbars, or page shells
- add pulsing, bouncing, or glowing feedback loops
- make the homepage more visually aggressive than the teaching pages
- depend on runtime font downloads for core typography
