---
name: synapse-pretext
description: Integrate @chenglou/pretext for zero-DOM text measurement and manual line layout in Synapse HTML outputs. Use when animated text fields, geometry-sensitive titles, obstacle-aware editorial layout, or virtualized text rendering are needed. Covers prepare/layout for height prediction and prepareWithSegments/layoutWithLines for manual rendering to Canvas, SVG, or DOM.
---

# Synapse Pretext

Use this skill to integrate Pretext.js text measurement and layout into Synapse outputs.

Pretext measures and positions multiline text through pure arithmetic — no `getBoundingClientRect`, no reflow, no DOM thrashing.

## When to Use

- Animated text fields that need precise height prediction before render
- Title routing with obstacle awareness (images, callouts, pull quotes)
- Virtualized or occluded text lists where height must be known upfront
- Canvas/SVG text rendering where DOM measurement is impossible
- Shrinkwrap width calculation for tight multiline containers
- Rich-text inline flow (code spans, mentions, chips) with proper wrapping

## Installation

```
npm install @chenglou/pretext
```

## Core API

### Use Case 1: Measure paragraph height without DOM

```js
import { prepare, layout } from '@chenglou/pretext'

const prepared = prepare('AGI 春天到了. بدأت الرحلة 🚀', '16px Inter')
const { height, lineCount } = layout(prepared, 320, 20) // pure arithmetic
```

- `prepare()` does one-time work: normalize, segment, measure with canvas. Returns opaque handle.
- `layout()` is the cheap hot path: pure arithmetic over cached widths.
- On resize, only rerun `layout()`, not `prepare()`.

Options: `{ whiteSpace: 'pre-wrap' }`, `{ wordBreak: 'keep-all' }`, `{ letterSpacing: n }`.

### Use Case 2: Manual line layout

```js
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const prepared = prepareWithSegments('AGI 春天到了', '18px "Helvetica Neue"')
const { lines } = layoutWithLines(prepared, 320, 26)
for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i].text, 0, i * 26)
```

### Variable-width layout (obstacle-aware)

```js
import { layoutNextLineRange, materializeLineRange, prepareWithSegments } from '@chenglou/pretext'

const prepared = prepareWithSegments(article, BODY_FONT)
let cursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0

while (true) {
  const width = y < image.bottom ? columnWidth - image.width : columnWidth
  const range = layoutNextLineRange(prepared, cursor, width)
  if (range === null) break
  const line = materializeLineRange(prepared, range)
  ctx.fillText(line.text, 0, y)
  cursor = range.end
  y += 26
}
```

### Shrinkwrap width

```js
import { measureLineStats, walkLineRanges } from '@chenglou/pretext'

const { lineCount, maxLineWidth } = measureLineStats(prepared, 320)
```

### Rich-text inline flow

```js
import { prepareRichInline, walkRichInlineLineRanges } from '@chenglou/pretext/rich-inline'

const prepared = prepareRichInline([
  { text: 'Ship ', font: '500 17px Inter' },
  { text: '@maya', font: '700 12px Inter', break: 'never', extraWidth: 22 },
  { text: "'s rich-note", font: '500 17px Inter' },
])
```

## Synapse Integration

### In blog HTML (synapse-design)

When `pretext` is required in HTML output:

- load via module import in a `<script type="module">` block
- use `prepareWithSegments(...)` then `layoutWithLines(...)`
- drive text layout from the resulting `lines` array
- apply at minimum to animated text fields
- extend to title, lead, and caption layout when those are part of the reading experience

### In slide decks (Synapse root)

- use `prepare()` + `layout()` to predict text height for slide layout
- use `measureLineStats()` to calculate tight container widths
- avoid DOM reads during animation frames

### In illustrations (synapse-figure)

- use manual line layout for Canvas/SVG text in technical diagrams
- use rich-text inline flow for label layouts with chips and code spans

## Rules

- Font string must match CSS exactly (e.g. `'16px Inter'` matches `font: 16px Inter`).
- `lineHeight` in `layout()` must match CSS `line-height`.
- Avoid `system-ui` font on macOS — use a named font.
- Runtime requires `Intl.Segmenter` and Canvas 2D text measurement.
- Do not claim pretext usage unless the page is actually using pretext APIs.

## Reference

- Package: `@chenglou/pretext` on npm
- Repo: https://github.com/chenglou/pretext
- Demos: https://chenglou.me/pretext/
- Docs: https://pretextjs.dev/
