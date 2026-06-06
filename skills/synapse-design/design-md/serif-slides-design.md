---
profile: serif-slides
kind: slides
label: Claude 衬线编辑
template: examples/quant-agent/quant-agent-slides.html
style: references/SLIDES-STYLE-SERIF.md
---

## Overview

Claude editorial slides — warm cream canvas `#faf9f5`, hairline borders, no grid, no hard shadows, blog-like reading rhythm.

## When to use

- User asks for Claude blog slides / 衬线 / editorial / 自然排版
- Deck should feel like a long-form article, not hand-drawn theater
- User is satisfied with Cormorant + Noto Serif SC pairing

## Typography

| Script | Font | Weight |
|---|---|---|
| English / Latin | Cormorant Garamond | 400 body · 500 titles |
| Chinese | Noto Serif SC (font-stack fallback) | 400 body · 500 titles |
| Code | JetBrains Mono | 400 |

```css
--font-display:
  "Cormorant Garamond", "EB Garamond", Garamond, "Noto Serif SC",
  "Songti SC", "Times New Roman", serif;
```

## Colors (claude-design)

- Canvas `#faf9f5` · Ink `#141413` · Body `#3d3d3a` · Primary `#cc785c`
- Hairline `#e6dfd8` · Surface card `#efe9de` · Surface dark `#181715`

## Figure prompt suffix

`Hand-drawn, black ink, cream or white background, coral accent strokes optional, editorial not cartoon`

## Placeholder resolution

Replace `{design.slides.profile}` with `serif-slides` and load this file + `references/SLIDES-STYLE-SERIF.md`. Reference HTML: `examples/quant-agent/quant-agent-slides.html`.
