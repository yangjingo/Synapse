# SLIDES-STYLE-SERIF: Claude Editorial Slides Protocol

> **Default for serif slides.** Use this variant when the deck should read like a Claude.com blog article — warm cream canvas, hairline borders, editorial typography. The hand-drawn Theater variant (`SLIDES-STYLE.md` + `WHYJ-SLIDES.html`) remains available for engineering-theater tone.

## 1. Visual Constitution

### Palette (claude-design tokens)

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#faf9f5` | Page floor — warm cream, never pure white |
| `--ink` | `#141413` | Headlines, strong text |
| `--body` | `#3d3d3a` | Running text |
| `--muted` | `#6c6a64` | Meta, dates, secondary |
| `--muted-soft` | `#8e8b82` | Captions, watermark |
| `--primary` | `#cc785c` | Coral accent — labels, links, bullets |
| `--primary-light` | `#fdf0e6` | Callout / pulse background |
| `--hairline` | `#e6dfd8` | 1px dividers and card borders |
| `--surface-card` | `#efe9de` | Figure prompt cards |
| `--surface-soft` | `#f5f3ee` | Inline code background |
| `--surface-dark` | `#181715` | Code window cards |
| `--highlight` | `rgba(204, 120, 92, 0.12)` | `mark` background |

### Typography — **the standard stack**

```css
--font-display:
  "Cormorant Garamond", "EB Garamond", Garamond, "Noto Serif SC",
  "Songti SC", "Times New Roman", serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace;
```

| Script | Font | Weight | Notes |
|---|---|---|---|
| **English / Latin** | **Cormorant Garamond** | 400 body · 500 titles · 600 emphasis | Copernicus substitute; negative letter-spacing on display |
| **Chinese** | **Noto Serif SC** | 400 body · 500 titles · 600 emphasis | Auto-selected via font stack fallback |
| **Code** | **JetBrains Mono** | 400 | Only in `.code-container` and inline `code` |

Google Fonts import:

```
Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400
Noto+Serif+SC:wght@400;500;600
JetBrains+Mono:wght@400;500
```

**Do not** mix Inter / Noto Sans SC into serif slides — that breaks English↔Chinese consistency.

### Layout

- **Canvas**: cream, no grid lines, no hard shadows.
- **Content width**: `max-width: 1180px`, padding `56px 72px`.
- **Mechanism grid**: `1.15fr / 0.85fr` (prose left, figure/code right).
- **Agenda / Takeaways / Reference**: single column `max-width: 720px`.
- **Pretext animation**: **disabled** (`.pretext-stage { display: none }`).
- **Reveal**: `center: false`, `width: 1280`, `height: 800`, `margin: 0.08`.

## 2. Page Type Rules

Same page sequence as Theater variant (Cover → Context → Agenda → Mechanism → Takeaways → Reference). Visual treatment differs:

### Cover (00)

```html
<section data-transition="none" class="cover-slide">
  <div class="slide-content cover-content">
    <div class="meta-tag">{Category}</div>
    <div class="meta-date">{YYYY年M月D日} · Why.J</div>
    <h1 class="cover-title">{project-id}</h1>
    <p class="cover-lead">{Chinese thesis — NOT "Synapse vX.X"}</p>
    <div class="cover-hr"></div>
    <div class="cover-meta">Synapse <strong>v{version}</strong> · {one-line context}</div>
  </div>
  <div class="footer-watermark">{project_id}</div>
</section>
```

- NO pretext, NO pulse, NO visual-box.
- `cover-title` uses Cormorant 400, `-0.03em` tracking.

### Context / Mechanism (01, 03-N)

- Grid layout with `.canvas-layer`.
- List bullets: coral dot (`5px` circle), not `→` arrows.
- `pulse-layer`: in-flow callout with left coral bar — not rotated, not absolute.
- `visual-box`: cream card + hairline border + `border-radius: 12px`.
- Code pages: `.visual-box:has(.code-container)` — transparent wrapper, dark code card only.

### Agenda / Takeaways (02, 10)

- `.canvas-layer.push-left` + `.no-bullet`.
- `fragment` reveal on each `<li>`.
- Takeaways Q4 → `.pulse-layer.fragment` below the list.

### Reference (11)

- `.canvas-footer` + `.ref-list`.
- Links: coral with subtle underline — no arrow bullets.

## 3. Component Patterns

### Figure prompt

```html
<div class="visual-box">
  <div class="figure-prompt-wrap">
    <div class="figure-prompt-label">Figure prompt</div>
    <div class="figure-prompt-text">[Description for Imagen / Excalidraw]</div>
  </div>
</div>
```

### Code window

```html
<div class="visual-box">
  <div class="code-container">
    <pre><code>// code here</code></pre>
  </div>
</div>
```

### Callout (pulse)

```html
<div class="pulse-layer pulse-animated">「 One-sentence abstraction. 」</div>
```

### Watermark

- Format: `{project_id}` or `whyj + {project_id} + YYYY/MM/DD`
- Style: `opacity: 0.32`, `color: var(--muted-soft)`, bottom-right

### HTML Title

`{Project Name} | Synapse v{version}`

## 4. Rendering Engine

Refer to `references/SERIF-SLIDES.html` for the complete template.

- **Reveal.js 4.3.1**
- **KaTeX 0.16.7** (optional `::math`)
- **No pretext** in serif variant
- **Reference implementation**: `examples/quant-agent/quant-agent-slides.html`

## 5. Variant Selection

| Criterion | Theater (`WHYJ-SLIDES.html`) | Serif (`SERIF-SLIDES.html`) |
|---|---|---|
| Tone | Hand-drawn engineering theater | Claude editorial blog |
| Background | White + grid | Cream canvas |
| English font | Gochi Hand | Cormorant Garamond |
| Chinese font | Gochi Hand (system fallback) | Noto Serif SC |
| Borders | 5–8px black + hard shadow | 1px hairline, no shadow |
| Pretext | Required | Disabled |
| Default when | User asks "Why.J slides" / theater | User asks "Claude blog" / editorial / serif |
